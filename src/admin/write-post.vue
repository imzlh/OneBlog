<script lang="ts" setup>
    import {
        CodeBlockLanguageSelector,
        EmojiSelector,
        ImageEditTool,
        ImageResizeBar,
        ImageToolBar,
        InlineFormatToolbar,
        Muya,
        ParagraphFrontButton,
        ParagraphFrontMenu,
        ParagraphQuickInsertMenu,
        PreviewToolBar,
        TableColumnToolbar,
        TableDragBar,
        TableRowColumMenu
    } from '@muyajs/core';
    import '@muyajs/core/lib/style.css';
    import type { Search } from '@muyajs/core/lib/types/search/index.js';
    import { onMounted, onUnmounted, reactive, ref, shallowReactive } from 'vue';
    import { Post } from '../utils/post';
    import { useRoute, useRouter } from 'vue-router';
    import { update_post } from './driver';
    import Autofill from './autofill.vue';
    import Filelist from './filelist.vue';
    import { config } from '../../package.json';
    import { CONFIG } from '../main';

    Muya.use(EmojiSelector);
    Muya.use(InlineFormatToolbar);
    Muya.use(ImageToolBar);
    Muya.use(ImageResizeBar);
    Muya.use(CodeBlockLanguageSelector);
    Muya.use(ImageEditTool);
    Muya.use(ParagraphFrontButton);
    Muya.use(ParagraphFrontMenu);
    Muya.use(TableColumnToolbar);
    Muya.use(ParagraphQuickInsertMenu);
    Muya.use(TableDragBar);
    Muya.use(TableRowColumMenu);
    Muya.use(PreviewToolBar);

    const container = ref<HTMLElement>(),
        CFG = reactive({
            search: false,
            replace: false,
            upload: false,
            search_res: 0,
            search_index: 0,
            search_text: '',
            replace_text: ''
        }),
        MORE = reactive({
            tag: false,
            category: false,
            attachment: false,
        }),
        el = defineEmits(['close', 'save']),
        _pid = useRoute().query.pid,
        post = typeof _pid == 'string' ? (Post.get(_pid) ?? Post.new()) : Post.new();
    post.set_reactive();
    let muya: Muya | undefined;

    const reqFullscreen = () => {
        if(document.fullscreenElement){
            document.exitFullscreen();
        }else{
            container.value?.requestFullscreen();
        }
    }

    let previousContent = '';
    onMounted(async function(){
        const text = await post.get_html(),
            box = document.createElement('div');
        box.classList.add('md-container');
        (container.value as HTMLElement).append(box);
        (muya = new Muya(box, {
            "markdown": text,
            "autoPairBracket": true,
            "autoPairMarkdownSyntax": true,
            "autoPairQuote": true,
            "locale": {
                name: "zh",
                resource: LANG_PACK
            },
            "math": true,
            "tabSize": 4
        })).init();
        muya.setContent(previousContent = await post.get_md());
    });

    function save(){
        if(!muya) return;
        
        update_post(post, muya.getMarkdown());
        alert('保存成功');
        el('save');
    }

    const REPManager = {
        obj: undefined as undefined | Search,
        el: undefined as Array<HTMLElement> | undefined,
        init(){
            if(!muya) return;
            this.obj = muya.search(CFG.search_text);

            const temp = container.value?.querySelectorAll('.mu-highlight, .mu-selection');
            this.el = [];
            temp?.forEach(item => {
                const react = item.getBoundingClientRect();
                react.width == 0 || react.height == 0 || this.el?.push(item as HTMLElement);
            });
            CFG.search_res = this.el?.length || 0,
            CFG.search_index == 0;
        },
        /**
         * @private
         */
        restore(){
            if(!this.el) return;
            const el = this.el[CFG.search_index];
            if(el) el.classList.add('mu-selection'),
                el.classList.remove('mu-highlight');
        },
        last(){
            if(!this.el || !this.el) return;

            this.restore();

            if(CFG.search_index == 0)
                CFG.search_index = CFG.search_res;

            CFG.search_index --;
            const el = this.el[CFG.search_index];

            el.scrollIntoView({
                'block': 'center'
            });
            el.classList.remove('mu-selection');
            el.classList.add('mu-highlight');
        },
        next(){
            if(!this.el || !this.el) return;

            this.restore();

            if(CFG.search_index+1 == CFG.search_res)
                CFG.search_index = -1;

            CFG.search_index ++;
            const el = this.el[CFG.search_index];

            el.scrollIntoView({
                'block': 'center'
            });
            el.classList.remove('mu-selection');
            el.classList.add('mu-highlight');
        },
        // rep(){
        //     this.obj?.replace(CFG.replace_text,{
        //         isSingle: true,
        //         isRegexp: false
        //     });
        //     this.obj.index = CFG.search_index;
        // },
        repAll(){
            this.obj?.replace(CFG.replace_text ,{
                isSingle: false,
                isRegexp: false
            });
            this.init();
        }
    };

    const img = [
        "avif",
        "webp",
        "jpg", "jpeg", "jxl",
        "png",
        "ico",
        "bmp",
        "svg"
    ];

    const arrayAtPoly = (a: any[]) => a[a.length -1];
    function plug(fullpath: string, file: string){
        if(!muya?.editor.activeContentBlock) return;
        const fpath = new URL(`${config.base}/${fullpath}`.replace(/\\/g, '/'), location.href).href;
        const data = muya.editor.activeContentBlock.text,
            cur = muya.editor.activeContentBlock.getCursor();
        let prefix = '';
        if(img.includes(arrayAtPoly(file.split('.')).toLowerCase()))
            prefix = '!';
        if(cur) muya.editor.activeContentBlock.text =
            data.substring(0, cur.start.offset) +
            prefix + `[ ${data.substring(cur.start.offset, cur.end.offset +1)} ](${encodeURI(fpath)})` +
            data.substring(cur.end.offset +1);
        else muya.editor.activeContentBlock.text =
            prefix + `[ ${file} ](${encodeURI(fpath)})`;
        muya.editor.activeContentBlock.focusHandler();
        muya.focus();
    }

    function mutexSelect(type: keyof typeof MORE){
        for(const key in MORE) 
            // @ts-ignore
            if(key != type) MORE[key] = false;
        MORE[type] = !MORE[type];
    }

    onUnmounted(() => muya && muya.destroy());

    const uninstall = useRouter().beforeEach((to, from) => {
        if(previousContent != muya!.getMarkdown()){
            return confirm('当前页面未保存，确定离开吗?');
        }
        return true;
    });
    onUnmounted(uninstall);
</script>

<template>
    <h1>写文章</h1>
    <div class="md-root" ref="container">
        <div class="md-info">
            <input type="text" class="title" v-model="post.info.title" placeholder="标题">
            <div class="more">
                <div @click="mutexSelect('tag')" :selected="MORE.tag">标签</div>
                <div @click="mutexSelect('category')" :selected="MORE.category">分类</div>
                <div @click="mutexSelect('attachment')" :selected="MORE.attachment">附件</div>
            </div>
            <div class="tags" v-show="MORE.tag">
                <div class="tag" v-for="(tag, index) in post.info.tags" :key="index">{{ tag }}</div>
                <Autofill :options="Post.get_all_tags()" @select="post.info.tags.push($event as string)" :clear-after-select="true" />
            </div>
            <Autofill type="text" class="category" v-show="MORE.category"
                :options="Post.get_all_categories()" @select="post.info.category = $event as string" />
            <div class="files" v-show="MORE.attachment">
                <Filelist @upload="plug" />
            </div>
        </div>

        <div class="md-tools">
            <div class="search" v-show="CFG.search || CFG.replace">
                <div>
                    <input type="text" placeholder="查找" v-model="CFG.search_text" @change="REPManager.init">
                    <span v-if="CFG.search_res">
                        {{ CFG.search_index }} / {{ CFG.search_res }}
                    </span>
                    <span v-else style="color: red;">
                        无结果
                    </span>
                    <!-- 上一个 -->
                    <div @click="REPManager.last()" vs-icon="top" />
                    <!-- 下一个 -->
                    <div @click="REPManager.next()" vs-icon="bottom" />
                    <!-- 关闭 -->
                    <div @click="CFG.search = CFG.replace = false" vs-icon="x" />
                </div>
                <div v-show="CFG.replace" style="margin-top: .35rem; gap: .35rem">
                    <input type="text" placeholder="替换" v-model="CFG.replace_text">
                    <!-- <button @click="REPManager.rep">替换</button> -->
                    <button @click="REPManager.repAll">全部替换</button>
                </div>
            </div>
        </div>
        <div class="md-action">
            <!-- 保存 -->
            <div @click="save" vs-icon="save" />
            <!-- 菜单2 -->
            <span></span>
            <div @click="muya?.undo()" vs-icon="point-left" />
            <div @click="muya?.redo()" vs-icon="point-right" />
            <!-- 搜索 -->
            <div @click="CFG.search = !CFG.search,CFG.replace = false" vs-icon="search" />
            <!-- 替换 -->
            <div @click="CFG.replace = !CFG.replace" vs-icon="mix" />
            <!-- 全屏 -->
            <div @click="reqFullscreen()" vs-icon="fullscreen"></div>
            <!-- 添加 -->
            <div @click="CFG.upload = !CFG.upload" :active="CFG.upload">
                <i vs-icon="plus" />
                <!-- TODO: 上传图片 -->
                <!-- <div @click.stop class="after" :active="CFG.upload"></div> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    const LANG_PACK = {
        "Insert Row Above": "上面插入行",
        "Insert Row Below": "下面插入行",
        "Remove Row": "删除所在行",
        "Align Left": "左对齐",
        "Align Center": "居中对齐",
        "Align Right": "右对齐",
        "Insert Column left": "在左边插入列",
        "Insert Column right": "在右边插入列",
        "Remove Column": "删除所在列",
        Paragraph: "普通段落",
        "Horizontal Line": "水平分割线",
        "Front Matter": "顶部信息块",
        "Header 1": "大标题",
        "Header 2": "2级标题",
        "Header 3": "中等标题",
        "Header 4": "4级标题",
        "Header 5": "5级标题",
        "Header 6": "小标题",
        "Table Block": "表格",
        "Display Math": "数学公式",
        "HTML Block": "HTML块",
        "Code Block": "代码块",
        "Quote Block": "引用文字",
        "Order List": "有序列表",
        "Bullet List": "无序列表",
        "To-do List": "任务列表",
        "Vega Chart": "Vega 图",
        Mermaid: "Mermaid",
        Plantuml: "Plantuml",
        "basic blocks": "基础块",
        headers: "标题",
        "advanced blocks": "高级块",
        "list blocks": "列表",
        diagrams: "图表",
        "No result": "无结果",
        "Search keyword...": "搜索关键字...",
        "Type / to insert...": "输入 / 插入段落",
        Emphasize: "加粗",
        Italic: "斜体",
        Underline: "下划线",
        Strikethrough: "删除线",
        Highlight: "高亮",
        "Inline Code": "行内代码",
        "Inline Math": "行内数学公式",
        Link: "超链接",
        Image: "图片",
        Eliminate: "清除样式",
        "Copy content": "复制内容",
        "Input Language Identifier...": "输入程序语言标识...",
        "Smileys & Emotion": "笑脸&情绪",
        "People & Body": "人物&身体",
        "Animals & Nature": "动物&自然",
        "Food & Drink": "食物&饮料",
        "Travel & Places": "旅游地",
        Activities: "活动",
        Objects: "物体",
        Symbols: "抽象",
        Flags: "国旗",
        Duplicate: "复制段落",
        "New Paragraph": "新建段落",
        Delete: "删除段落",
        "Edit Image": "编辑图片",
        "Inline Image": "行内图片",
        "Remove Image": "删除图片",
        "Image src placeholder": "图片链接",
        "Confirm Text": "确定",
        "Loading...": "加载中...",
        "Invalid Diagram Code": "图表渲染失败",
        "Empty Diagram": "空图表",
        "Input Mathematical Formula...": "输入数学公式...",
        "Input Front Matter...": "输入页眉...",
        "Invalid Mathematical Formula": "数学公式错误",
        "Empty Mathematical Formula": "空数学公式",
        "Click to add an image": "添加图片",
        "Load image failed": "添加图片失败"
    };
</script>

<style lang="scss">
    .md-root{
        background-color: #fbfcff;
        overflow: hidden;
        height: 100%;
        position: absolute;
        top: 0;left: 0;
        width: 100%;

        display: flex;
        flex-direction: column;

        @mixin btn_div() {
            padding: .3rem;
            border-radius: .2rem;

            &:hover, &[active=true] {
                background-color: rgb(229 229 229);
            }

            [vs-icon] {
                display: block;
                height: 1rem;
                width: 1rem;
            }
        }

        > *{
            flex-shrink: 0;
        }

        .md-info{
            > .title{
                border: none;
                border-radius: .35rem;
                width: 90%;
                margin: .6rem auto;
                padding: .65rem 1rem;
                display: block;
                outline: none;
                font-size: 1rem;

                &:focus{
                    box-shadow: .05rem .1rem .5rem #efefef;
                }
            }

            > .more{
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.5rem;
                margin: .35rem 1rem;

                > div{
                    padding: .25rem .75rem;
                    border-bottom: solid .1rem transparent;
                    font-size: .9rem;

                    &[selected=true] {
                        border-color: rgb(205, 211, 255);
                    }
                }
            }

            > .tags {
                margin: .35rem;
                background-color: #fafafa;
                padding: .65rem;
                border-radius: .3rem;
                display: flex;
                gap: .75rem;

                > * {
                    max-width: 6rem;
                    border: none;
                    outline: none;
                    background-color: white;
                    padding: .25rem .65rem;
                    border-radius: 10rem;
                    box-shadow: .05rem .1rem .3rem #f1f4ff;
                    font-size: 1rem;
                }
            }

            > .category{
                background: white;
                padding: .35rem .65rem;
                width: 90%;
                margin: auto;
                border-radius: .45rem;
            }
        }

        .md-action{
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.3rem;
            border-radius: 0.45rem;
            background-color: rgb(247 247 247);
            box-shadow: 0 .1rem .5rem #d7d7d7;
            position: absolute;
            bottom: 0.75rem;
            left: 50%;
            transform: translateX(-50%);
            margin: auto;
            z-index: 6;

            > span{
                margin: 0 .1rem;
                height: .9rem;
                width: .1rem;
                background-color: #dddddd;
            }

            > div{
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                @include btn_div();

                > div.after{
                    position: absolute;
                    left: 50%;
                    bottom: 100%;
                    transform: translate(-50%, -1rem) scale(0);
                    opacity: 0;
                    padding: 1rem;
                    border-radius: .35rem;
                    background-color: #f0f0f0;
                    border: solid .1rem #d4d4d4;
                    transition: opacity .2s;
                    z-index: 10;

                    min-width: 12rem;
                    min-height: 12rem;

                    &[active=true]{
                        transform: translate(-50%, -1rem) scale(1);
                        opacity: 1;
                    }
                }
            }
        }

        .md-tools{
            position: absolute;
            top: 2rem;
            right: 1rem;
            z-index: 18;

            > *{
                width: 100vw;
                max-width: 22rem;
                min-width: 18rem;

                background-color: rgb(245, 243, 243);
                padding: .5rem;
                border-radius: .3rem;
            }

            > .search{
                > div{
                    display: flex;
                    align-items: center;

                    > *{
                        flex-shrink: 0;
                    }

                    > span{
                        font-size: .8rem;
                        margin-left: .45rem;
                        flex-grow: 1;
                    }

                    > input{
                        outline: none;
                        border: solid .05rem rgb(194, 194, 194);
                        border-radius: .25rem;
                        padding: .35rem .65rem;
                        width: 50%;

                        &:focus{
                            border-color: #52b5f3;
                        }
                    }

                    > div{
                        width: 1rem;
                        height: 1rem;
                        @include btn_div();
                    }

                    > button{
                        outline: none;
                        background-color: white;
                        padding: .25rem .5rem;
                        border-radius: .2rem;
                        border: solid .05rem #dbdbdb;
                        cursor: pointer;
                        margin: 0;
                    }
                }

            }
        }

        .md-container{
            flex-grow: 1;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }
    }
</style>

<script lang="ts">

</script>
