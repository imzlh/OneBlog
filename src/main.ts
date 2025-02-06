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
    /**
     * 站点名称
     */
    title: 'izBlog',
    /**
     * 站点描述
     */
    description: '一个简单的博客',
    /**
     * 站点关键词
     * 多个关键词用英文逗号(,)分隔
     */
    keywords: 'izBlog, blog, 博客',

    /**
     * 文章时间格式化方式
     * 遵循 https://www.php.net/manual/zh/function.date.php
     */
    format_time: 'Y-m-d H:i',

    /**
     * 允许显示和发表评论
     * （使用前确保启动了服务器且package.json中配置了server）
     */
    comment: true,
    /**
     * 评论每页显示数量
     */
    comment_per_page: 10,
    /**
     * 评论必填字段
     * 数组，支持name,email,content,website
     */
    comment_required: ['name', 'email', 'content'],
    /**
     * 评论排序方式
     * asc: 升序，desc: 降序
     */
    comment_order: 'desc',

    /**
     * XSS配置
     * 请自行参考 DOMPurify 的配置项
     */
    xss_config: {
        ALLOW_UNKNOWN_PROTOCOLS: true
    },

    /**
     * 文章分页数量
     */
    post_per_page: 15,
    /**
     * 图片加载时默认的背景
     * 可以为图片： `url('example.jpg')`
     * 也可以为颜色： `#fff`
     */
    loading_background: 'gray',
    /**
     * 默认缩略图配置
     * 允许为连续数字序列(seqnum)，如001.jpg, 002.jpg, 003.jpg...
     * 此时需要`range` `pad` `url`属性
     * 也可以手动指定，`{ type: 'fixed', url: [] }`
     * 此时会直接从数组里挑选一张图片作为缩略图
     * 只有一张时直接指定`url`属性即可
     */
    default_thumb: {
        type: 'seqnum',
        range: [0, 50],
        pad: 3,
        url: 'thumb/%u.webp' as string | string[]
    },

    /**
     * ICP备案号
     */
    icp: '',
    /**
     * 友情链接，对应 { name: url }
     */
    friend_link: {} as Record<string, string>,
    /**
     * 心灵鸡汤的API(每次刷新都会显示新的一条)
     * 支持xml、json、text格式
     */
    api_soup: {
        /**
         * API地址
         */
        url: 'https://api.oick.cn/dutang/api.php',
        /**
         * API返回数据类型
         * `text`: 纯文本
         * `json`: JSON格式
         * `xml`: XML格式
         */
        type: 'text' as 'text' | 'json' | 'xml',
        /**
         * 如果返回JSON，需要指定键名为数据
         */
        key: '',    // JSON?
        /**
         * 如果返回XML，需要指定标签选择器
         * 选择器的语法与 CSS选择器 或者说jQuery选择器 相同
         */
        selector: ''    // XML?
    },
    /**
     * 社交链接，对应 { name: url }
     */
    social_link: {} as Record<string, string>,

    /**
     * 统计JS代码，每次刷新都会执行
     * 允许使用runScript方法，如`runScript('统计代码URL')`
     */
    statistic: '',
    /**
     * 额外添加的HTML代码，会在文章后面
     * 注意：<script>标签由于浏览器限制不会运行，请使用`statistic`指定
     */
    footer_html: '',

    /**
     * 配置vue-router的路由规则
     * 请参考 https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%99%E5%92%8C%E5%85%A8%E5%8F%B0%E8%B7%AF%E7%94%B1
     * 注意： 目前只有post、tag、category、search、page这五个路由是动态的，还有一个别名路由"post-by-id"
     */
    route: {
        home: '/',
        post: '/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})',
        "post-by-id": '/p/:id',
        tag: '/tag/:tag',
        category: '/category/:category',
        search: '/search/:keyword',
        page: '/:path(.+)'
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
                redirect: from => ({ name: 'search', params: { keyword: " " } , query: { [key]: from.params[key] } }),
            });
        }else{
            console.warn(`Route ${key} not found!`);
        }
    }

    routeCfg.push({
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
