import { isEqual } from "https://deno.land/x/lodash_es@v0.0.2/mod.ts";
import { encode, decode, buf2int, int2buf } from "../src/utils/bjson.ts";
import { assert } from "jsr:@std/assert@^0.221.0/assert";
import { AssertionError } from "jsr:@std/assert@^0.221.0/assertion-error";

const test_data = [
    ": bool值测试",
    true,
    false,
    ": 空值测试",
    null,
    undefined,
    "",
    0,
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
    ": 大数字测试",
    Date.now(),
    ": 浮点数测试",
    123.456,
    ": BigInt测试",
    (function(){
        let num = 0n;
        for (let index = 0; index < 10; index++)
            num += BigInt(Math.floor(Math.random() * 100000));
        return num;
    })(),
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
            fn: async () => {
                const res = await decode(encode(data));
                if(!isEqual(res, data)){
                    throw new AssertionError('Not matched: ' + String(res) + ' != ' + String(data));
                }
            }
        });
    }
}

// 额外测试
let pass = true;
for(let i = 1 ; i < Number.MAX_SAFE_INTEGER; i *= 0xf){
    try{
        assert(buf2int(int2buf(i)) === i)
    }catch{
        console.error(i);
        pass = false;
        break;
    }
}
if(pass) console.log('All passed!')