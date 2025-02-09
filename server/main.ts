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
import { Comment } from './db.ts';
import Server from './server.ts';

export const VERSION = _JSON.version;

Deno.chdir(import.meta.dirname!);

const { config } = _JSON;
export const CONFIG = JSON.parse(Deno.readTextFileSync('../' + config.base + config.config));

const [ , scheme, hostname, _port ] = config.server.match(/^(\w+):\/\/(.+)\:(\d+)?/)!,
    port = parseInt(_port);

new Server(scheme, port, hostname)
    .header('Access-Control-Allow-Origin', '*')
    .header('Access-Control-Allow-Methods', 'GET,POST,PUT')
    .on('GET', async res => {
        const postid = res.url.searchParams.get('id');
        if(!postid) return res.status(404).end();
        const comments = await Promise.all(
            (await Comment.get_by_postid(postid))
                .map(comment => comment.export())
        );
        res.end(encode(comments));
    })
    .on('POST', async res => {
        if(!res.req.body || !res.url.searchParams.has('id')) return res.status(400).end();
        const data = await decode(res.req.body);
        // 检查是否满足评论要求
        const checks = CONFIG.comment_required || ['name', 'email', 'content'];
        if(checks.some((key: string) => !data[key])) return res.status(400).end();
        // 保存评论
        await Comment.put_by_postid(res.url.searchParams.get('id')!, data);
        res.status(204).end();
    })
    .on('PUT', async res => {
        if(!res.req.body || !res.url.searchParams.has('id')) return res.status(400).end();
        const data = await decode(res.req.body);
        // 检查是否满足评论要求
        const checks = CONFIG.comment_required || ['name', 'email', 'content'];
        if(checks.some((key: string) => !data[key])) return res.status(400).end();
        // 添加子评论
        const comment = await Comment.get_by_id(res.url.searchParams.get('id')!);
        if(!comment) return res.status(404).end();
        await comment.putComment(data);
        res.status(204).end();
    })
    .start();