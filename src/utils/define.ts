const get_extension = (fname: string) => fname.substring(fname.lastIndexOf('.') + 1).toLowerCase();

/**
 * 图片扩展名
 */
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'heic', 'heif', 'avif'];
export const is_image = (fname: string) => IMAGE_EXTENSIONS.includes(get_extension(fname));

/**
 * 视频扩展名
 */
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mkv'];
export const is_video = (fname: string) => VIDEO_EXTENSIONS.includes(get_extension(fname));

/**
 * 音频扩展名
 */
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'mka', 'opus'];
export const is_audio = (fname: string) => AUDIO_EXTENSIONS.includes(get_extension(fname));