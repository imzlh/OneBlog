/**
 * 将基于SQLite3的typecho博客转换为OneBlog的Markdown格式
 * 注意：此程序基于Deno运行，需要先安装Deno环境
 * 
 * @copyright iz
 * @license MIT
 */

import { Database } from "jsr:@db/sqlite";

Deno.chdir(import.meta.dirname!);
const [ dbfile, prefix, replace ] = Deno.args;
if (!dbfile || !prefix) {
    console.error("Usage: typecho2one.ts <db> <prefix> <your site upload dir path>");
    Deno.exit(1);
}

try{
    Deno.openSync(dbfile, { read: true }).close();
}catch(e){
    console.error("Error: ", e);
    Deno.exit(1);
}

const db = new Database(dbfile, { readonly: true });
const packageJson = '../package.json';

const { config } = JSON.parse(Deno.readTextFileSync(packageJson));
const path_posts = Deno.realPathSync('../' + config.base + config.post_dir);

const stmt = db.prepare(
    `SELECT cid,title,text,created,slug,type,"order",modified FROM ${prefix}contents`,
);
const relationships = db.prepare(`SELECT cid,mid FROM ${prefix}relationships`)
    .all().reduce((obj, cur) => {
        if (Array.isArray(obj[cur.cid])) {
            obj[cur.cid].push(cur.mid);
        } else {
            obj[cur.cid] = [cur.mid];
        }
        return obj;
    }, {});
const metas = db.prepare(`SELECT mid,name,type FROM ${prefix}metas`).all()
    .reduce((obj, cur) => {
        obj[cur.mid] = {
            ...cur,
        };
        return obj;
    }, {});
for (const post of stmt.iter()) {
    const { cid, title, slug, created, modified, text, type, order } = post;
    if (type !== "post" || !text) {
        continue;
    }
    const metaIds: number[] | undefined = relationships[cid];
    const categories: string[] = [];
    const tags: string[] = [];
    if (metaIds) {
        metaIds.forEach((mid) => {
            const meta = metas[mid];
            switch (meta.type) {
                case "category":
                    if (meta.name !== "Uncategorized") {
                        categories.push(`- ${meta.name}`);
                    }
                    break;
                case "tag":
                    tags.push(`- ${meta.name}`);
                    break;
                default:
            }
        });
    }
    const postMD = `title: ${title}
name: ${slug}
modified: ${modified * 1000}
category: ${categories[0].substring(2)}
created: ${created * 1000}
tags: ${tags.map(tag => tag.substring(2)).join(",")}
order: ${order}

---

<!-- export from typecho -->
${text.replace("<!--markdown-->", "").replace(replace, config.base + config.static_dir)}
`;
    Deno.writeTextFileSync(path_posts + '/' + slug.replace(/[:*?"<>|]/g, '-') + '.md', postMD);
    console.log(new Date(created * 1000).toISOString(), title);
}

console.log("Done!")
