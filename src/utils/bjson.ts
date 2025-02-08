/**
 * 二进制JSON
 * 格式如下：
 * 【BJSON头】
 * 【vint标注的键名】【meta，用于标注数据类型和长度chunk的长度】【长度】【内容】
 * 或
 * 【vint标注的键名】【meta，用于标注Object/Array长度的长度】【长度】【...子元素】
 */

/**
 * BJson数据类型，占据4Bit
 */
enum DataType {
    Boolean,    // bool

    Null,       // null

    String,     // 字符串
    
    NInt,       // 负整数
    Int,        // 正整数
    Float,      // 浮点数
    BigInt,     // 大整数
    Infinity,   // 正无穷

    Array,      // 数组
    Object,     // 对象

    Binary,     // 二进制数据
    Unknown     // 未知类型
}

export const Unknown = Symbol("Unknown");

/**
 * 动态大小整数编码(小端)
 * @param obj 整数
 * @returns Buffer
 */
export function int2buf(value: number | bigint): Uint8Array {
    let isInt = Number.isInteger(value);
    value = typeof value === "bigint" ? value : BigInt(Math.abs(value));
    const bytes: number[] = [];
    do {
        bytes.push(Number(value & 0xffn));
        value >>= 8n;
    } while (value > 0n);

    // 确保数组长度不超过 15 个字节
    if (isInt && bytes.length > 0xf) {
        throw new Error("Value " + value + " exceeds the maximum safe integer for bJSON");
    }

    // 将数组转换为 Uint8Array
    return new Uint8Array(bytes.reverse());
}

/**
 * 编码数据
 * @param obj 原始数据
 * @param pipe 写入流
 * @param in_array 数组中undefined必须占位，这个需要设置为true
 */
async function encodeData(obj: any, pipe: WritableStreamDefaultWriter<Uint8Array>, in_array = false): Promise<void> {
    if (obj === undefined){
        if(in_array) await pipe.write(new Uint8Array([(DataType.Null << 4) + 1]));
        return;
    }
    
    switch (typeof obj) {
        case "boolean":
            await pipe.write(new Uint8Array([(obj ? 1 : 0) + (DataType.Boolean << 4)]));
            break;

        case "symbol":
            await pipe.write(new Uint8Array([DataType.Unknown << 4]));
            break;

        case "number":
            if (Number.isNaN(obj)) {
                await pipe.write(new Uint8Array([DataType.Unknown << 4]));
            } else if (!Number.isFinite(obj)) {
                await pipe.write(new Uint8Array([(DataType.Infinity << 4) + (obj < 0 ? 0 : 1)]));
            } else if (Number.isInteger(obj)) {
                const buf = int2buf(obj);
                await pipe.write(new Uint8Array([((obj < 0 ? DataType.NInt : DataType.Int) << 4) + buf.length]));
                await pipe.write(buf);
            } else {
                const dat = new DataView(new ArrayBuffer(8));
                dat.setFloat64(0, obj);
                const res = new Uint8Array(dat.buffer);
                await pipe.write(new Uint8Array([(DataType.Float << 4) + res.length]));
                await pipe.write(res);
            }
            break;

        case "string":
            const strEncoded = new TextEncoder().encode(obj);
            const strLenBuf = int2buf(strEncoded.length);
            await pipe.write(new Uint8Array([(DataType.String << 4) + strLenBuf.length]));
            await pipe.write(strLenBuf);
            await pipe.write(strEncoded);
            break;

        case "bigint":
            const bigIntBuf = int2buf(obj);
            const bigIntLenBuf = int2buf(bigIntBuf.length);
            if(bigIntLenBuf.length > 0b1111) throw new Error("BigInt too long");
            await pipe.write(new Uint8Array([(DataType.BigInt << 4) + bigIntLenBuf.length]));
            await pipe.write(bigIntLenBuf);
            await pipe.write(bigIntBuf);
            break;

        case "function":
        case "object":
            if (Array.isArray(obj)) {
                const arrLenBuf = int2buf(obj.length);
                if(arrLenBuf.length > 0b1111) throw new Error("Array too long");
                await pipe.write(new Uint8Array([(DataType.Array << 4) + arrLenBuf.length]));
                await pipe.write(new Uint8Array(arrLenBuf));
                for (const item of obj)
                    await encodeData(item, pipe, true);
            } else if (obj === null) {
                await pipe.write(new Uint8Array([DataType.Null << 4]));
            } else if (obj instanceof ArrayBuffer || obj.buffer instanceof ArrayBuffer) {
                const len = int2buf(obj.byteLength);
                if(len.length > 0b1111) throw new Error("Binary too long");
                await pipe.write(new Uint8Array([(DataType.Binary << 4) + len.length]));
                await pipe.write(new Uint8Array(len));
                await pipe.write(new Uint8Array(obj));
            } else {
                const keys = Object.keys(obj).filter(i => obj[i]),
                    keyBuf = int2buf(keys.length);
                const keylen = keyBuf.length;
                if(keylen > 0b1111) throw new Error("Object has too many sub-elements");
                await pipe.write(new Uint8Array([(DataType.Object << 4) + keylen]));
                await pipe.write(keyBuf);

                for (const key of keys) {
                    const keyEncoded = new TextEncoder().encode(key);
                    if (keyEncoded.length > 255) throw new Error("Key too long");
                    await pipe.write(new Uint8Array([keyEncoded.length]));
                    await pipe.write(keyEncoded);
                    await encodeData(obj[key], pipe);
                }
            }
            break;
    }
}

/**
 * 解码整数
 * @param buf 整数的字节数组
 * @returns 整数
 */
export function buf2int(buf: Uint8Array, to_bigint: true): bigint;
export function buf2int(buf: Uint8Array, to_bigint?: false | undefined): number;
export function buf2int(buf: Uint8Array, to_bigint?: boolean): number | bigint {
    let num = 0n;
    for (let i = 0; i < buf.length; i++)
        num = (num << 8n) | BigInt(buf[i]);
    if(num > BigInt(Number.MAX_SAFE_INTEGER))
        throw new Error("Value exceeds the maximum safe integer for bJSON");
    return to_bigint ? num : Number(num);
}

Uint8Array.prototype.pad = function(len: number, pad: number = 0) {
    if(len <= this.length) return this;
    const res = new Uint8Array(len);
    res.set(this, 0);
    if(pad) res.fill(pad, this.length);
    return res;
}
declare global {
    interface Uint8Array {
        /**
         * 填充数组
         * @param len 目标长度
         * @param pad 填充值，默认为0
         */
        pad(len: number, pad?: number): Uint8Array;
    }
}

/**
 * 解码数据
 * @param buffer 编码后的数据数组
 * @returns 解码后的原始数据
 */
function decodeData(pipe: ReadableStreamDefaultReader<Uint8Array>): Promise<any> {
    let overflowBuffer: Uint8Array | undefined;
    let offset = 0;
    let expectedBuffer: Uint8Array;

    async function readBytes(len = 1): Promise<Uint8Array> {
        expectedBuffer = new Uint8Array(len);
        offset = 0;

        if (overflowBuffer) {
            if (overflowBuffer.byteLength >= len) {
                expectedBuffer.set(overflowBuffer.slice(0, len));
                overflowBuffer = overflowBuffer.byteLength > len ? overflowBuffer.slice(len) : undefined;
                return expectedBuffer;
            } else {
                expectedBuffer.set(overflowBuffer, 0);
                offset = overflowBuffer.byteLength;
                overflowBuffer = undefined;
            }
        }

        while (offset < len) {
            const readResult = await pipe.read();
            if (readResult.done) {
                throw new Error(`Unexpected end of stream (expected ${len} bytes, but only ${offset} bytes available)`);
            } else {
                const newData = readResult.value;
                const expected = len - offset;
                expectedBuffer.set(newData.subarray(0, expected), offset);
                offset += Math.min(newData.byteLength, expected);

                if (newData.byteLength > expected) {
                    overflowBuffer = newData.slice(expected);
                }
            }
        }

        return expectedBuffer;
    }

    async function decodeValue(): Promise<any> {
        let header = 0;
        try {
            header = (await readBytes())[0];
        } catch (error) {
            // 当一个也没有读取到时，得知应该是被忽略的undefined
            if (expectedBuffer && offset == 0) return undefined;
            throw error;
        }
        const dataType = header >> 4,
            additionalData = header & 0xf;

        switch (dataType) {
            case DataType.Boolean:
                return !!additionalData;

            case DataType.Null:
                return additionalData ? undefined : null;

            case DataType.String: {
                const strLen = buf2int(await readBytes(additionalData));
                return new TextDecoder().decode(await readBytes(strLen));
            }

            case DataType.Int:
            case DataType.NInt: {
                const res = await readBytes(additionalData);
                const num = buf2int(res);
                return dataType === DataType.NInt ? -num : num;
            }

            case DataType.Float: {
                const view = new DataView((await readBytes(additionalData)).pad(8).buffer);
                return view.getFloat64(0);
            }

            case DataType.BigInt: {
                const numLen = buf2int(await readBytes(additionalData));
                return buf2int(await readBytes(numLen), true);
            }

            case DataType.Array: {
                const arrLen = buf2int(await readBytes(additionalData));
                const arr: any[] = [];
                for (let i = 0; i < arrLen; i++) {
                    arr.push(await decodeValue());
                }
                return arr;
            }

            case DataType.Object: {
                const obj: Record<string, any> = {};
                const objLen = buf2int(await readBytes(additionalData));
                for (let i = 0; i < objLen; i++) {
                    const keyLen = (await readBytes())[0];
                    const key = new TextDecoder().decode(await readBytes(keyLen));
                    obj[key] = await decodeValue();
                }
                return obj;
            }

            case DataType.Binary: {
                const binaryLen = buf2int(await readBytes(additionalData));
                return await readBytes(binaryLen);
            }

            case DataType.Unknown:
                return Unknown;

            case DataType.Infinity:
                return header & 0x1 ? Infinity : -Infinity;

            default:
                throw new Error(`Unknown data type ${dataType}`);
        }
    }

    return decodeValue();
}


/**
 * 压缩数据
 * @param data 原始数据
 * @returns 压缩后的流
 */
export const encode = (data: any) => {
    const pipe = new CompressionStream('gzip'),
        writer = pipe.writable.getWriter();
    encodeData(data, writer).then(() => writer.close());
    return pipe.readable;
};

/**
 * 解压数据
 * @param stream 压缩后的流
 * @returns 解压后的原始数据
 */
export const decode = async (stream: ReadableStream) => {
    const pipe = new DecompressionStream('gzip'),
        reader = pipe.readable.getReader();
    stream.pipeTo(pipe.writable);
    const res = await decodeData(reader);
    if(!(await reader.read()).done)
        throw new Error("Invalid data length");
    return res;
};

/**
 * 编码数据并转换为Blob
 * @param data 原始数据
 * @returns Blob
 */
export async function encode2Blob(data: any): Promise<Blob> {
    const pipe = encode(data).getReader();
    const chunks: Uint8Array[] = [];
    let res = await pipe.read();
    while (!res.done) {
        chunks.push(res.value);
        res = await pipe.read();
    }
    return new Blob(chunks, { type: 'application/gzip+bjson' });
}