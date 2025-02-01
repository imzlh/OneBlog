import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { config } from '../package.json';
import EPage from './page/error.vue';
import Home from './page/home.vue';
import Post from './page/post.vue';
import Search from './page/search.vue';
import Page from './page/page.vue';
import { __init } from './utils/post';

const url_base = new URL(config.base, location.href);
let mainApp: ReturnType<typeof createApp> | undefined;
let app_destroyed = false;

/**
 * 获取文件的URL
 * @param path 文件路径
 * @returns 文件的URL
 * @example // 获取index.html的URL
 * get_file('index.html')
 */
export const get_file = (path: string) => new URL(path, url_base);

/**
 * 显示错误并霸屏
 * 注意：只有在Fatal错误时才可以调用，否则整个APP会崩溃
 * @param code 错误代码，推荐使用HTTP状态码
 * @param reason 错误原因
 * @param handle 可选，处理函数
 * @example // 404并显示页面不存在，点击返回
 * show_error(404, '页面不存在', () => {
 *    history.back();
 * });
 */
export const show_error = (code: number, reason: string, handle?: () => any) =>{
    if(mainApp) mainApp.unmount();
    if(app_destroyed) throw new Error('App has been destroyed!');
    app_destroyed = true;
    createApp(EPage, {
        code,
        reason,
        handle
    }).mount(document.body);
}

// 读取主配置
const main_config = {
    title: 'izBlog',
    description: '一个简单的博客',
    keywords: 'izBlog, blog, 博客',

    // 遵循 https://www.php.net/manual/zh/function.date.php
    format_time: 'Y-m-d H:i',

    comment: true,
    comment_per_page: 10,
    comment_required: ['name', 'email', 'content'],
    comment_order: 'desc',

    // DOMPurify配置 Config interface
    xss_config: {
        ALLOW_UNKNOWN_PROTOCOLS: true
    },

    post_per_page: 15,
    default_thumb: 'thumb.webp',
    loading_background: 'gray',

    icp: '萌ICP备20249588号',
    friend_link: {} as Record<string, string>,
    api_soup: {
        url: 'https://api.oick.cn/dutang/api.php',
        type: 'text' as 'text' | 'json' | 'xml',
        key: '',    // JSON?
        selector: ''    // XML?
    },
    social_link: {} as Record<string, string>,

    route: {
        home: '/',
        post: '/:year(\d{4})/:month(\d{2})/:day(\d{2}\.html)',
        "post-by-id": '/p/:id',
        tag: '/tag/:tag',
        category: '/category/:category',
        search: '/search/:keyword',
        page: '/p/:page(.*)'
    }
};
export { main_config as CONFIG };

// 尝试启动主程序
try{
    const user_config = await (await fetch(get_file(config.config))).json()
    for(const key in user_config)
        // @ts-ignore
        main_config[key] = user_config[key];
    document.title = main_config.title;

    // 添加meta标签
    const meta = document.createElement('meta');
    meta.name = 'keywords';
    meta.content = main_config.keywords;
    document.head.appendChild(meta);
    const meta2 = document.createElement('meta');
    meta2.name = 'description';
    meta2.content = main_config.description;
    document.head.appendChild(meta2);

    // 解析路由
    const routeCfg: RouteRecordRaw[] = [];
    const routeMap = {
        home: Home,
        post: Post,
        "post-by-id": Post,
        search: Search,
        page: Page
    }
    for(const key in main_config.route){
        // @ts-ignore
        const path = main_config.route[key];
        if(key in routeMap){
            routeCfg.push({
                path,
                // @ts-ignore
                component: routeMap[key],
                name: key
            });
        }else if(['category', 'tag'].includes(key)){
            routeCfg.push({
                path,
                name: key,
                redirect: from => ({ name: 'search', params: { [key]: from.params[key] } }),
            });
        }else{
            console.warn(`Route ${key} not found!`);
        }
    }

    routeCfg.push({
        path: '/:pathMatch(.*)*',
        name: '404',
        component: EPage,
        props: {
            code: 404,
            reason: '页面不存在',
            handle: () => history.back() // 点击返回
        }
    }, {
        path: '/error/:code(\\d+)',
        name: 'error',
        component: EPage,
        props: route => ({
            code: parseInt(typeof route.params.code === 'string' ? route.params.code : route.params.code[0]),
            reason: typeof route.query.reason === 'string' ? route.query.reason : "未知错误",
            handle: () => location.replace('/')
        })
    });
    __init().then(() => main(routeCfg));
}catch(e){
    // 显示 
    show_error(500, '无法获取配置，请联系站长！');
    console.error(e);
}

function main(routeCfg: any){
    if(app_destroyed) return;
    const router = createRouter({
        history: createWebHistory(),
        routes: routeCfg
    });
    mainApp = createApp(App);
    mainApp.use(router);
    mainApp.mount(document.body);
}
