/**
 * 获取一个随机颜色
 * @returns 随机颜色
 */
export function random_color() {
    const color_rgb = [];
    for (let i = 0; i < 3; i++)
        color_rgb.push(Math.floor(Math.random() * 128 + 128));
    return `rgb(${color_rgb.join(',')})`;
}

/**
 * 实用工具：根据字符生成随机颜色
 * @param char 字符
 * @returns 随机颜色
 */
export function color_by_char(char: string) {
    const ascii = char.charCodeAt(0);
    const r = ascii & 0b111;
    const g = (ascii >> 3) & 0b111;
    const b = ascii >> 6;
    const rate = Math.floor(Math.random() * 32)
    return `rgb(${r * rate + 128}, ${g * rate + 128}, ${b * rate + 128})`;
}