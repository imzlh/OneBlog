import { is_image } from "./define";
import { CONFIG, get_file, show_error } from "../main";
import { decode, encode2Blob } from "./bjson";
import { config } from '../../package.json';
import { parse, use as mdUse, Renderer } from 'marked';
import markedAlert from 'marked-alert';
import { baseUrl } from 'marked-base-url';
import { reactive } from "vue";
// import markedHighlight from 'marked-highlight';

// highlight.js
// import hljs from 'highlight.js';
// import 'highlight.js/scss/vs.scss';
// await import('./hljs');

export function get_thumb(post: IPost){
    if(post.attachment.length > 0)
        return new URL(
            post.attachment[post.attachment.findIndex(is_image)],
            get_file(config.base).href
        ).href;
    // 解析
    const $t = CONFIG.default_thumb;
    const throwError = (em: string) => {
        throw new Error(`Invalid default_thumb config: ${em}`);
    }
    switch($t.type){
        case 'seqnum':
            if(typeof $t.url != 'string') throw new Error('URL should be a string when using seqnum type');
            const index = Math.round(Math.random() * ($t.range[1] - $t.range[0])) + $t.range[0];
            return get_file($t.url.replace('%u', index.toString().padStart($t.pad, '0'))).href;

        case 'fixed':
            if((typeof $t.url == 'string') && $t.url.length != 0)
                throwError('URL should be an array that contains multiple URLs when using fixed type');
            return get_file($t.url[Math.floor(Math.random() * $t.url.length)]).href;

        default:
            if(typeof $t.url != 'string')
                throwError('URL should be a string.\nIf you want to randomly select from multiple URLs, use `seqnum` or `fixed` type.')
            return get_file($t.url as string).href;
    }
}
// 遵循PHP写法
export function generate_date(post: IPost){
    const date = new Date(post.created),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        week = date.getDay();
    
    return CONFIG.format_time.replace(/[a-z]/gi, match => {
        switch(match){
            case 'Y': return year.toString().padStart(4, '0');
            case 'm': return month.toString().padStart(2, '0');
            case 'd': return day.toString().padStart(2, '0');
            case 'H': return hour.toString().padStart(2, '0');
            case 'i': return minute.toString().padStart(2, '0');
            case 's': return second.toString().padStart(2, '0');
            case 'w': return week.toString();
            case 'D': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][week];
            case 'j': return day.toString();
            case 'l': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][week];
            case 'N': return (week === 0 ? 7 : week).toString();
            case 'S': return ['st', 'nd', 'rd'][day] || 'th';
            case 'W': return Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / 604800000).toString();
            case 'F': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1];
            case 'M': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
            case 'n': return month.toString();
            case 't': return new Date(year, month, 0).getDate().toString();
            case 'L': return new Date(year, 1, 29).getDate() === 29 ? '1' : '0';
            case 'o': return year.toString();
            case 'y': return year.toString().slice(-2);
            case 'a': return hour < 12 ? 'am' : 'pm';
            case 'A': return hour < 12 ? 'AM' : 'PM';
            case 'g': return (hour % 12).toString();
            case 'G': return hour.toString();
            case 'h': return (hour % 12).toString().padStart(2, '0');
            case 'c': return date.toISOString();
            case 'r': return date.toUTCString();
            case 'U': return Math.floor(date.getTime() / 1000).toString();
            case 'z': 
                const first = new Date(year, 0, 1);
            return Math.ceil((date.getTime() - first.getTime()) / 86400000).toString();
            default: 
                console.warn(`Unknown time format character: ${match}`);
            return match;
        }
    })
}

const cache = {
    post: [] as Array<IPost>
}


class PostList{
    constructor(private $posts: Array<IPost>){}

    get array(){
        return this.$posts.map(post => new Post(post));
    }

    get raw(){
        return this.$posts;
    }

    sort_by_time(reverse: boolean = false){
        this.$posts.sort((a, b) => Number(reverse ? b.created - a.created : a.created - b.created));
        return this;
    }

    sort_by_order(reverse: boolean = false){
        this.$posts.sort((a, b) => (reverse ? b.order - a.order : a.order - b.order));
        return this;
    }

    sort_by_tags(){
        const tagList: Record<string, IPost[]> = {};
        for(const post of this.$posts){
            for(const tag of post.tags){
                if(!tagList[tag]){
                    tagList[tag] = [];
                }
                tagList[tag].push(post);
            }
        }
        return tagList;
    }

    sort_by_category(){
        const categoryList: Record<string, IPost[]> = {};
        for(const post of this.$posts){
            if(post.category && !categoryList[post.category]){
                categoryList[post.category] = [];
            }
            if(post.category){
                categoryList[post.category].push(post);
            }
        }
        return categoryList;
    }
}

export class Post{
    static get(name: string){
        const res = cache.post.find(post => post.name == name);
        return res ? new this(res) : null;
    }

    static select_by_date(year: number, month: number, day: number){
        return new PostList(cache.post.filter(
            post => {
                const date = new Date(post.created);
                return date.getFullYear() == year
                    && date.getMonth() +1 == month
                    && date.getDate() == day
            }
        ));
    }

    static select_by_tag(tag: string){
        return new PostList(cache.post.filter(post => post.tags.includes(tag)));
    }

    static select_by_category(category: string){
        return new PostList(cache.post.filter(post => post.category === category));
    }

    static select_by_condition(category: string, tag: string[], keyword: string){
        return new PostList(cache.post.filter(post => {
            if(category && post.category !== category) return false;
            if(tag.length > 0 && !tag.every(t => post.tags.includes(t))) return false;
            if(keyword && !post.title.includes(keyword) && !post.outline?.includes(keyword)) return false;
            return true;
        }));
    }

    static get_all(){
        const ts_now = Date.now();
        return new PostList(cache.post.filter(post => post.created < ts_now));
    }

    static get_all_tags(){
        const tags = new Set<string>();
        cache.post.forEach(post => post.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }

    static get_all_categories(){
        const categories = new Set<string>();
        cache.post.forEach(post => post.category && categories.add(post.category));
        return Array.from(categories);
    }

    static new(){
        return new this({
            "attachment": [],
            "created": 0,
            "modified": 0,
            "name": "",
            "title": "",
            "order": 0,
            "tags": []
        }, true);
    }

    constructor(private $post: IPost, private $create = false){}

    add_attachment(file: File){
        this.$post.attachment.push(file.name);
    }
    
    async get_md(){
        if(this.$create) return '';
        const fe = await fetch(get_file(config.post_dir + this.$post.name + '.md'))
        if(!fe.ok) throw new Error('Failed to fetch post content');
        const text = await fe.text();

        // 分割
        const split_line = text.match(/[\r\n]+\-+[\r\n]+/);
        let content = text;
        if(split_line) content = text.substring(split_line.index! + split_line[0].length);

        return content;
    }

    async get_html(){
        const md = await this.get_md();
        return parse(md, {
            gfm: true,
            breaks: true,
            renderer
        });
    }

    async get_comment(): Promise<Array<IComment>>{
        if(!CONFIG.comment) throw new Error('Comment is disabled');
        const url = config.server + '?id=' + this.$post.created,
            res = await fetch(url);
        if(res.status == 204) return [];
        if(res.status != 200) throw new Error('Failed to fetch comment');
        return await decode(res.body!);
    }

    async post_comment(comment: Partial<IComment>, from?: IComment): Promise<void>{
        if(!CONFIG.comment) throw new Error('Comment is disabled');
        for(const key of CONFIG.comment_required)
            // @ts-ignore
            if(!comment[key]) throw new Error(`Comment ${key} is required`);
        const url = config.server + '?id=' + (from?.uuid || this.$post.created),
            res = await fetch(url, { method: from ? 'PUT' : 'POST', body: await encode2Blob(comment) });
        if(res.status != 200) throw new Error('Failed to post comment');
    }

    get info(){
        return this.$post;
    }

    set_reactive(){
        this.$post = reactive(this.$post);
    }

    save(outline: string){
        if(this.$create){
            cache.post.push(this.$post);
            this.$post.created = Date.now();
            this.$post.modified = this.$post.created;
            this.$post.name = this.$post.created.toString(16);
            this.$create = false;
        }else{
            this.$post.modified = Date.now();
        }
        this.$post.outline = outline;
    }

    del(){
        if(!this.$create){
            const idx = cache.post.findIndex(post => post.name === this.$post.name);
            if(idx >= 0) cache.post.splice(idx, 1);
        }
        this.$create = false;
        console.log('Post deleted:', this.$post.name);
    }
}

// 初始化post
let renderer: Renderer;
export const __init = async () => {
    try{
        const stream = (await fetch(get_file(config.index))).body;
        if(!stream) throw new Error('Failed to fetch post index');
        cache.post = await decode(stream);
    }catch(e){
        show_error(500, 'Failed to load post index: ' + (e as Error).message);
    }
    /* 启用GFM格式的Markdown解析
    * 
    * > [!NOTE]
    * > Highlights information that users should take into account, even when skimming.
    */
    mdUse(markedAlert())

    // 启用相对路径
    mdUse(baseUrl(get_file("").href));

    // 启用代码高亮
    // mdUse(markedHighlight({
    //     emptyLangClass: 'hljs',
    //     langPrefix: 'hljs language-',
    //     highlight(code, lang) {
    //         const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    //         return hljs.highlight(code, { language }).value;
    //     }
    // }));

    // 拷贝code
    function copyCode(el: HTMLPreElement){
        const code = el.getElementsByTagName('code')[0].textContent;
        const msg = el.getElementsByClassName('copy-btn')[0];
        if(code)
            navigator.clipboard.writeText(code).then(() => {
                
                msg.textContent = '复制成功';
                setTimeout(() => msg.textContent = '复制' , 1000);
            }).catch(() => {
                msg.textContent = '复制失败';
                setTimeout(() => msg.textContent = '复制', 1000);
            });
    }
    // @ts-ignore
    globalThis.copyCode = copyCode;
    const commonCodeCopy = `<button class="copy-btn" onclick="copyCode(this.parentElement)">复制</button>`
    const testElement = document.createElement('div');

    // 自定义
    renderer = new Renderer();
    renderer.html = html => html.raw;
    renderer.image = ({href, title, text}) => {
        if(href.startsWith(CONFIG.img_cdn.from)){
            href = href.replace(CONFIG.img_cdn.from, CONFIG.img_cdn.to);
        }
        return `<img src="${href}" alt="${text}" title="${title}">`;
    }
    renderer.code = ({text, lang, escaped}) => {
        if(!escaped){
            testElement.innerText = text;
            text = testElement.innerHTML;
        }
        if(lang){
            return `<pre>${commonCodeCopy}<code class="hljs language-${lang}">${text}</code></pre>`;
        }else{
            return `<pre>${commonCodeCopy}<code>${text}</code></pre>`;
        }
    }
}

export const parseMd = (content: string) => parse(content, {
    gfm: true,
    breaks: true,
    renderer
});

export function exportIndex(){
    return encode2Blob(cache.post);
}