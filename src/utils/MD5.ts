/**
 * TypeScript MD5 算法实现
 * @param message 要计算哈希的字符串
 * @returns 返回32位小写MD5哈希值
 */
export function md5(message: string): string {
    // 初始化变量
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;

    // 预处理消息
    const msgBytes = stringToUtf8Bytes(message);
    const msgLen = msgBytes.length;
    const totalLen = msgLen + 1 + 8; // 原始消息长度 + 1字节的0x80 + 8字节的长度信息

    // 计算需要填充的0的个数
    const blockCount = Math.ceil(totalLen / 64);
    const paddedLen = blockCount * 64;
    const padBytes = new Uint8Array(paddedLen);

    // 复制原始消息
    padBytes.set(msgBytes);

    // 添加填充位
    padBytes[msgLen] = 0x80; // 添加1后面跟着7个0

    // 添加原始消息长度（以位为单位，小端序）
    const bitLen = msgLen * 8;
    const lenBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        lenBytes[i] = (bitLen >>> (i * 8)) & 0xFF;
    }
    padBytes.set(lenBytes, paddedLen - 8);

    // 处理每个512位块
    for (let i = 0; i < blockCount; i++) {
        const blockStart = i * 64;
        const block = padBytes.slice(blockStart, blockStart + 64);

        // 将块分解为16个32位字（小端序）
        const words: number[] = [];
        for (let j = 0; j < 16; j++) {
            const wordStart = j * 4;
            words[j] = (block[wordStart] | (block[wordStart + 1] << 8) | 
                       (block[wordStart + 2] << 16) | (block[wordStart + 3] << 24)) >>> 0;
        }

        // 初始化哈希值
        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;

        // 主循环
        for (let j = 0; j < 64; j++) {
            let f, g;
            if (j < 16) {
                f = (b & c) | ((~b) & d);
                g = j;
            } else if (j < 32) {
                f = (d & b) | ((~d) & c);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                f = b ^ c ^ d;
                g = (3 * j + 5) % 16;
            } else {
                f = c ^ (b | (~d));
                g = (7 * j) % 16;
            }

            const temp = d;
            d = c;
            c = b;
            b = b + leftRotate((a + f + K[j] + words[g]), S[j]);
            a = temp;
        }

        // 更新哈希值
        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
    }

    // 将哈希值转换为十六进制字符串
    return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

// 辅助函数：将字符串转换为UTF-8字节数组
function stringToUtf8Bytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// 辅助函数：左循环移位
function leftRotate(value: number, shift: number): number {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

// 辅助函数：将32位数转换为8位十六进制字符串
function toHex(value: number): string {
    let hex = '';
    for (let i = 0; i < 4; i++) {
        const byte = (value >>> (i * 8)) & 0xFF;
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}

// MD5常量
const K: number[] = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
];

// MD5循环左移位数
const S: number[] = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];