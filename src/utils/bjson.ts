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
    False,      // false
    True,       // true

    Null,       // null

    String,     // 字符串
    
    NInt,       // 负整数
    Int,        // 正整数
    Float,      // 浮点数
    BigInt,     // 大整数
    Infinity,   // 正无穷
    NInfinity,  // 负无穷

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
function int2buf(value: number): Uint8Array {
    value = Math.abs(value);
    const bytes = new Uint8Array(0xf);
    for(var i = 0; value > 0; i++){
        if(i == 0xf) throw new Error("Value " + value + " exceeds the maximum safe integer for bJSON");
        bytes[i] = (value >>= (i * 8));
    }
    return bytes.subarray(0, i -1);
}

/**
 * 动态大小BigInt编码
 * @param obj BigInt
 * @returns Buffer
 */
function bigint2buf(num: bigint) {
    const dats: Array<number> = [];
    do dats.unshift(Number(num & 0xffn)); while ((num >>= 8n) > 0n);
    return dats;
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
            await pipe.write(new Uint8Array([(obj ? DataType.True : DataType.False) << 4]));
            break;

        case "undefined":
            await pipe.write(new Uint8Array([DataType.Null << 4]));
            break;

        case "symbol":
            await pipe.write(new Uint8Array([DataType.Unknown << 4]));
            break;

        case "number":
            if (Number.isNaN(obj)) {
                await pipe.write(new Uint8Array([DataType.Unknown << 4]));
            } else if (!Number.isFinite(obj)) {
                await pipe.write(new Uint8Array([(obj < 0 ? DataType.NInfinity : DataType.Infinity) << 4]));
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
            await pipe.write(new Uint8Array(strLenBuf));
            await pipe.write(strEncoded);
            break;

        case "bigint":
            const bigIntBuf = bigint2buf(obj);
            const bigIntLenBuf = int2buf(bigIntBuf.length);
            if(bigIntLenBuf.length > 0b1111) throw new Error("BigInt too long");
            await pipe.write(new Uint8Array([(DataType.BigInt << 4) + bigIntLenBuf.length]));
            await pipe.write(new Uint8Array(bigIntLenBuf));
            await pipe.write(new Uint8Array(bigIntBuf));
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
                const keys = Object.keys(obj).filter(i => obj[i] !== undefined);
                const keylen = int2buf(keys.length).length;
                if(keylen > 0b1111) throw new Error("Object has too many sub-elements");
                await pipe.write(new Uint8Array([(DataType.Object << 4) + keylen]));
                await pipe.write(new Uint8Array(int2buf(keys.length)));

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
function conv2int(buf: Uint8Array): number {
    let num = 0;
    for (let i = 0; i < buf.length; i++)
        num += buf[i] << (i * 8);
    return num;
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
    let index = 0;
    let overflowBuffer: Uint8Array | undefined,
        expectedBuffer = new Uint8Array(0),
        offset = 0;

    async function readBytes(len = 1) {
        expectedBuffer = new Uint8Array(len);
        offset = 0;
        if(overflowBuffer)
            if(overflowBuffer.byteLength >= len) {
                expectedBuffer.set(overflowBuffer.slice(0, len));
                overflowBuffer = overflowBuffer.slice(len);
                return expectedBuffer;
            }else{
                expectedBuffer.set(overflowBuffer, 0);
                overflowBuffer = undefined;
            }
        // 没有填充满：直接读取
        while (offset < expectedBuffer.byteLength) {
            const readResult = await pipe.read();
            if (readResult.done) {
                throw new Error("Unexpected end of stream (expected " + len + " bytes, but only " + offset + " bytes available)");
            }else{
                // 如果读取到的数据，将其与当前 buffer 合并
                const newData = readResult.value,
                    expected = len - offset;
                expectedBuffer.set(newData.subarray(0, expected), offset);
                offset += Math.min(newData.byteLength, expected);

                // 溢出
                if(newData.byteLength > expected)
                    overflowBuffer = newData.slice(expected);
            }
        }

        return expectedBuffer;
    }

    async function decodeValue(): Promise<any> {
        let header = 0;
        try{
            header = (await readBytes())[0];
        }catch{
            if(index === 0) return undefined;
        }
        const dataType = header >> 4;

        switch (dataType) {
            case DataType.False:
            return false;

            case DataType.True:
            return true;
            
            case DataType.Null:
            return header & 0b1 ? undefined : null;

            case DataType.String:
                const lenlen = header & 0b1111, len = conv2int(await readBytes(lenlen));
            return new TextDecoder().decode(await readBytes(len));

            case DataType.Int:
            case DataType.NInt:
                let num = 0;
                const nlen = header & 0b1111;
                for (let i = 0; i < nlen; i++) {
                    const byte = (await readBytes())[0];
                    num = (num << 8) | (byte & 0xff);
                }
            return dataType === DataType.NInt ? -num : num;

            case DataType.Float:
                const len2 = header & 0b1111;
                const view = new DataView((await readBytes(len2)).pad(8).buffer);
            return view.getFloat64(0);

            case DataType.BigInt:
                let num2 = 0n;
                const nlen2 = header & 0b1111,
                    nlen3 = conv2int(await readBytes(nlen2));
                for (let i = 0; i < nlen3; i++) {
                    const byte = (await readBytes())[0];
                    num2 = (num2 << 8n) | BigInt(byte & 0xff);
                }
            return num2;

            case DataType.Array:
                const lenlen2 = header & 0b1111, arrLen = conv2int(await readBytes(lenlen2));
                const arr = [];
                for (let i = 0; i < arrLen; i++)
                    arr.push(await decodeValue());
            return arr;

            case DataType.Object:
                const obj: Record<string, any> = {},
                    lenlen3 = header & 0b1111, objLen = conv2int(await readBytes(lenlen3));
                for(let i = 0; i < objLen; i++) {
                    const keyLen = (await readBytes())[0],
                        key = new TextDecoder().decode(await readBytes(keyLen));
                    obj[key] = await decodeValue()
                }
            return obj;

            case DataType.Binary:
                const binaryLen = conv2int(await readBytes(header & 0b1111));
            return readBytes(binaryLen);

            case DataType.Unknown:
            return Unknown;

            case DataType.Infinity:
            return Infinity;

            case DataType.NInfinity:
            return -Infinity;

            default:
                throw new Error("Unknown data type " + dataType + " at offset " + index);
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
    const _pipe = encode(data),
        { readable, writable } = new DecompressionStream('gzip');
    _pipe.pipeTo(writable);
    const pipe = readable.getReader();
    const chunks: Uint8Array[] = [];
    let res = await pipe.read();
    while (!res.done) {
        chunks.push(res.value);
        res = await pipe.read();
    }
    return new Blob(chunks, { type: 'application/bjson' });
}
// @debug
// @ts-ignore
globalThis.encode = encode;
// @ts-ignore
globalThis.decode = decode;
// @ts-ignore
globalThis.toInt = conv2int;
// @ts-ignore
globalThis.toBuf = int2buf;
// @ts-ignore
globalThis.toBlob = encode2Blob;