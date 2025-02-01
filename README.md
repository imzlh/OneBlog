<h1 style="text-align: center"> OneBlog </h1>
模仿Pinghsu，前端动态化的简约Blog

# 为何？
都2025了，在人均Chrome和ES2021的现在，博客居然还在苦苦挣扎于IE11?
为了最大兼容性，还在使用PHP?
而且服务端填充内容实在是太慢了，于是我希望...自己写一个！

# 流程
 - 将releases的包解压到你的网站 **根目录**
 - 打开`package.json`和`data/config.json`自己修改你要的配置
    推荐VSCode，有JSON schema悬浮提示
 - 迁移你的博客数据，参考`utils/typecho2one.ts`
 - 打开网站，看到一片天！