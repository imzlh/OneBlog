import { encode } from "../src/utils/bjson.ts";
import { parse } from 'npm:marked';
import { DOMParser } from "jsr:@b-fuze/deno-dom";

Deno.chdir(import.meta.dirname!);

// const args = parseArgs(Deno.args);
const packageJson = '../package.json';

const { config } = JSON.parse(Deno.readTextFileSync(packageJson));
const path_posts = Deno.realPathSync('../' + config.base + config.post_dir);
const CONFIG = JSON.parse(Deno.readTextFileSync('../' + config.base + config.config));

const cannot_be_attached = ['.html', '.htm'];

export function get_attachments(data: string): string[] {
    // 解析MarkDown链接
    const matches = data.matchAll(/\[.*?\]\(([^\d].*?)\)/g),
        //   [1]: https://hi.imzlh.top/usr/uploads/2024/07/1096801274.webp
        matches2 = data.matchAll(/\s+\[\d+\]\:\s*(.+)\s*/g);
    return Array.from(matches, (match) => match[1].trim())
        .concat(Array.from(matches2, (match) => match[1].trim()))
        .filter((url) => cannot_be_attached.every((ext) =>!url.endsWith(ext)));
}

const posts = [] as IPost[];
for(const file of Deno.readDirSync(path_posts)){
    if(file.isFile && file.name.endsWith('.md')) try{
        const { ctime, mtime } = Deno.statSync(path_posts + '/' + file.name);
        const _data = Deno.readTextFileSync(path_posts + '/' + file.name),
            _split = _data.match(/[\r\n]+-{3,}[\r\n]+/)!,
            meta = _data.substring(0, _split.index),
            content = _data.substring(_split.index! + _split[0].length);

        // 解析meta(key: value\n)
        const metaObj = {} as Record<string, string>;
        for(const line of meta.split(/[\r\n]{1,2}/)){
            const _match = line.match(/^(\w+):\s*(.*)$/);
            if(_match)
                metaObj[_match[1].toLowerCase()] = _match[2];
        }

        // 解析MD内容
        const dom = new DOMParser().parseFromString(await parse(content), 'text/html');

        // 提取内容
        const data: IPost = {
            created: (new Date(metaObj.created) || ctime)!.getTime(),
            modified: (new Date(metaObj.modified) || mtime)!.getTime(),
            title: metaObj.title,
            order: metaObj.order ? parseInt(metaObj.order) : 0,
            attachment: metaObj.attachment ? metaObj.attachment.split(',') : get_attachments(content),
            tags: metaObj.tags ? metaObj.tags.split(/\s*\,\s*/) : [],
            category: metaObj.category,
            outline: dom.body.innerText.replaceAll(/\s+/g, ' ').trim().substring(0, CONFIG.post_outline),
            name: file.name.replace(/\.md$/, '')
        }
        posts.push(data);
        console.log('I', data.title, ctime!.toUTCString());
    }catch(e){
        console.error('Failed to parse post', file.name, e);
    }
}

posts.sort((a, b) => a.order - b.order);
await Deno.writeFile('../' + config.base + config.index, encode(posts));
console.log('Index updated');

// siteMap
function generate_link(post: IPost){
    const template = (CONFIG.route ?? {
        post: '/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})'
    }).post.split('/'),
    date = new Date(post.created);
    for(const key in template){
        if(template[key].startsWith(':year'))
            template[key] = date.getFullYear().toString();
        else if(template[key].startsWith(':month'))
            template[key] = (date.getMonth() + 1).toString().padStart(2, '0');
        else if(template[key].startsWith(':day'))
            template[key] = date.getDate().toString().padStart(2, '0');
    }
    return template.join('/');
}
const siteMap = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
<?xml-stylesheet type='text/xsl' href='sitemap.xsl'?>
<urlset xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\" xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
${posts.map(post => `
    <url>
        <loc>${generate_link(post)}</loc>
        <lastmod>${new Date(post.modified).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${ post.tags.includes('garbage') ? .2 : .8 }</priority>
    </url>
`).join('')}
</urlset>`.replaceAll(/\s+/g, ' ');

Deno.writeTextFileSync('../' + config.base + '/sitemap.xml', siteMap);
console.log('SiteMap updated');
console.info('Tip: copy your sitemap.xml to your website root directory to enable search engine indexing.')