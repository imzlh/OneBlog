/**
 * WebDAV-based driver for OneBlog
 */
import { config } from '../../package.json';
import { CONFIG } from '../main';
import { exportIndex, parseMd, Post } from '../utils/post';

class RemoteFile {
    static __check_enabled() {
        if (!config.admin) throw new Error('WebDAV driver is not enabled');
    }

    static async __get(f: string) {
        this.__check_enabled();
        const url = `${CONFIG.davroot}${CONFIG.davbase ?? config.base}${f}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res;
    }

    static async __delete(f: string) {
        this.__check_enabled();
        const url = `${CONFIG.davroot}${CONFIG.davbase ?? config.base}${f}`;
        const res = await fetch(url, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`Failed to delete ${url}: ${res.statusText}`);
        return res;
    }

    static async __put(f: string, data: XMLHttpRequestBodyInit) {
        this.__check_enabled();
        const url = `${CONFIG.davroot}${CONFIG.davbase ?? config.base}${f}`;
        const res = await fetch(url, {
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
        if (!res.ok) throw new Error(`Failed to put ${url}: ${res.statusText}`);
        return res;
    }

    static __put_with_progress(f: string, data: XMLHttpRequestBodyInit, progress?: (loaded: number, total: number) => void) {
        this.__check_enabled();
        const url = `${CONFIG.davroot}${CONFIG.davbase ?? config.base}${f}`;
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        if(progress) xhr.onprogress = e => progress(e.loaded, e.total);
        xhr.send(data);
        return new Promise<void>((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 201 || xhr.status === 204) resolve();
                else reject(new Error(`Failed to put ${url}: ${xhr.statusText}`));
            };
            xhr.onerror = () => reject(new Error(`Failed to put ${url}: ${xhr.statusText}`));
        });
    }

    static async __mkdir(p: string) {
        this.__check_enabled();
        const url = `${CONFIG.davroot}${CONFIG.davbase ?? config.base}${p}/`;
        const res = await fetch(url, {
            method: 'MKCOL'
        });
        if (!res.ok) throw new Error(`Failed to mkdir ${url}: ${res.statusText}`);
    }

    private $path;
    // private $pos = 0;

    constructor(f: string) {
        this.$path = f;
    }

    read() {
        return RemoteFile.__get(this.$path);
    }

    write(data: string | ArrayBuffer | Blob | FormData) {
        return RemoteFile.__put(this.$path, data);
    }
}

export namespace driver {
    export async function update_config() {
        RemoteFile.__put(config.config, JSON.stringify(CONFIG, null, 4));
    }

    export async function update_post(post: Post, contents: string) {
        // precheck
        const html = await parseMd(contents.replace(/<!--.+?-->/g, ''));
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const info = dom.body.innerText.replace(/\s+/g,'').trim();
        post.save(info.substring(0, 150));
        // write to file
        const content = `title: ${post.info.title}
created: ${new Date(post.info.created).toDateString()}
modified: ${new Date(post.info.modified).toDateString()}
tags: ${post.info.tags.join(',')}
category: ${post.info.category}
order: ${post.info.order}

---

<!-- edited by OneBlog Admin -->
${contents}
`;
        await RemoteFile.__put(config.post_dir + post.info.name + '.md', content);

        // repack
        const str = await exportIndex();
        await RemoteFile.__put(config.index, str);
    }

    export async function delete_post(post: Post) {
        post.del();
        const rpath = config.post_dir + post.info.name + '.md';
        const ctx = await RemoteFile.__get(rpath).then(r => r.text());
        await RemoteFile.__delete(rpath);

        // repack
        const str = await exportIndex();
        await RemoteFile.__put(config.index, str);

        console.warn('Post deleted:', post.info, '\ndeleted content:\n', ctx);
    }

    export async function upload_attachment(file: File, progress?: (loaded: number, total: number) => void) {
        const date = new Date();
        const fname = crypto.randomUUID();
        const basePath = `${config.static_dir}/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`.replace('//', '/');
        const path = `${basePath}/${fname}.${file.name.split('.').pop()}`
        await RemoteFile.__put_with_progress(path, file, progress);
        return path;
    }

    export const del = RemoteFile.__delete;
}