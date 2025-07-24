/**
 * 将过长的md文件名进行重命名
 */

/// <reference path="../src/type/post.d.ts" />
import { encode, decode } from "../src/utils/bjson.ts";
import pkg from '../package.json' with { type: "json" };

Deno.chdir(import.meta.dirname!);
const { config } = pkg;
const path_posts = Deno.realPathSync('../' + config.base + config.post_dir);
const CONFIG = JSON.parse(Deno.readTextFileSync('../' + config.base + config.config));

const index = await decode(
    Deno.openSync('../' + config.base + config.index, { read: true }).readable
) as Array<IPost>;
for(const md of Deno.readDirSync(path_posts)){
    if(md.isFile && md.name.endsWith('.md')){
        const oname = md.name.replace('.md', '');
        const info = index.find(i => i.name == oname);
        if(info){
            const cr = info.created.toString(16);
            Deno.renameSync(path_posts + '/' + md.name, path_posts + '/' + cr + '.md');
            info.name = cr;
        }
    }
}

const ostream = Deno.openSync('../' + config.base + config.index, { write: true }).writable;
await encode(index).pipeTo(ostream);