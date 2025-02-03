/**
 * OneBlog 基于Deno的评论系统
 * 简单实现，不是很完善，仅供参考
 * 
 * @version 1.0
 * @author iz
 * @license MIT
 */
import _JSON from '../package.json' with { type: 'json' };
import { decode, encode } from '../src/utils/bjson.ts';

Deno.chdir(import.meta.dirname!);

const { config } = _JSON;
const CONFIG = JSON.parse(Deno.readTextFileSync('../' + config.base + config.config));

const [ , scheme, hostname, _port ] = config.server.match(/^(\w+):\/\/(.+)\:(\d+)?/)!,
    port = parseInt(_port),
    kvdb = await Deno.openKv('./oneblog.db');
    
async function fill_comment(id: string){
    const data = await kvdb.get(['comment', id]) as any;
    if(!data) return null;
    if(data.children) data.children = await Promise.all(data.children.map(fill_comment));
    return data;
}

const server = Deno.serve({
    port, hostname
}, async function(req, addr) {
    const url = new URL(req.url) ,id = url.pathname.substring(1);
    if(!id.match(/\d+$/)) return new Response('', {
        status: 400
    });
    
    if(req.method === 'OPTIONS'){
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Max-Age": "86400"
            }
        });
    }

    if(req.method === 'GET'){
        const comments = await kvdb.get<Array<string>>(['by_post', id]);    // UUID
        if(!comments) return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }); // No Content
        
        if(!comments.value) return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }); // No Content

        const data = encode(await Promise.all(comments.value.map(fill_comment)));
        return new Response(data, {
            headers: {
                'Content-Type': 'application/bjson',
                "Access-Control-Allow-Origin": "*"
            }
        });
    }else if(req.method === 'POST'){
        const body = await req.json();
        if((CONFIG.comment_required as Array<string>).every(key => body[key] === undefined))
            return new Response('', {
                status: 400
            }); // Bad Request
        let uuid;
        do uuid = crypto.randomUUID(); while (await kvdb.get(['comment', uuid]));
        const data = {
            name: body.name,
            email: body.email,
            website: body.site,
            content: body.content,
            ip: req.headers.get('x-real-ip') || addr.remoteAddr.toString(),
            agent: req.headers.get('user-agent') || '',
            created: Date.now(),
            children: [],
            uuid
        } satisfies IComment;

        // 从文章评论
        if(url.searchParams.has('post')){
            let comments = await kvdb.get(['by_post', id]) as any as string[];
            if(!comments) comments = [];
            comments.push(uuid);
            kvdb.atomic().check().set(['by_post', id], data);
        }else{
            let parent = await kvdb.get(['comment', id]) as any;
            if(!parent) return new Response('', {
                status: 404
            }); // Not Found
            parent.children.push(uuid);
            kvdb.atomic().check().set(['comment', uuid], data);
        }

        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        });
    }else{
        return new Response('', {
            status: 405
        }); // Method Not Allowed
    }
});