import { isEqual } from "https://deno.land/x/lodash_es@v0.0.2/mod.ts";
import { encode, decode } from "../src/utils/bjson.ts";
import { assert } from "jsr:@std/assert@^0.221.0/assert";

const test_data = [
    ": bool值测试",
    true,
    false,
    ": null值测试",
    null,
    undefined,
    ": 字符串测试",
    "hello",
    ": 大字符串测试",
    "hello world".repeat(100),
    ": 负整数测试",
    -123,
    ": 正整数测试",
    123,
    ": 负浮点数测试",
    -123.456,
    ": NaN测试",
    NaN,
    ": 大数字测试",
    0x1234567890,
    ": 浮点数测试",
    123.456,
    ": BigInt测试",
    (function(){
        let num = 0n;
        for (let index = 0; index < 10; index++)
            num += BigInt(Math.random() * 100000);
        return num;
    }),
    ": 正无穷测试", 
    Infinity,
    ": 负无穷测试",
    -Infinity,
    ": 数组测试",
    [1, 2, 3],
    ": 对象测试",
    { a: 1, b: 2, c: 3 },
    ": 二进制数据测试",
    new Uint8Array([1, 2, 3, 4, 5]),
    ": 多层Object测试",
    [undefined, null, true, false, "hello", { a: 1, b: 2, c: 3, d: [1, 2, 3, { e: 4, f: 5 } ] }],
]

let tip = '';
for(let i = 0; i < test_data.length; i += 1) {
    const data = test_data[i];
    if(typeof data === "string" && data.startsWith(":")) {
        tip = data.slice(1);
    } else {
        Deno.test({
            name: tip,
            fn: async () => assert(isEqual(await decode(encode(data)), data))
        });
    }
}