/**
 * 类似于Python的range函数，返回一个从start到end（不包括end）的数组，步长为step
 * @param start 开始值
 * @param end 结束值
 * @param step 步长
 */
export function range(start: number, end: number, step: number = 1): number[] {
    const result: number[] = [];
    for (let i = start; i <= end; i += step) {
        result.push(i);
    }
    return result;
}
