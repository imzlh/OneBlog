#!/bin/sh

cp ./package.json ./dist/package.json
mkdir ./dist/data/
cat <<EOF >./dist/data/config.json
{
    "\$schema": "https://raw.githubusercontent.com/imzlh/OneBlog/refs/heads/master/src/type/config-schema.json",
    "title": "Blog",
    "description": "一个简单的博客",
    "keywords": "blog, 博客",
    "format_time": "Y-m-d H:i",
    "comment": true,
    "comment_per_page": 10,
    "comment_required": ["name", "email", "content"],
    "comment_order": "desc",
    "xss_config": {
        "ALLOW_UNKNOWN_PROTOCOLS": true
    },
    "post_per_page": 10,
    "post_outline": 150,
    "icp": "无",
    "friend_link": {
        "iz": "https://hi.imzlh.top/"
    },
    "api_soup": {
        "url": "https://api.oick.cn/dutang/api.php",
        "type": "text"
    },
    "social_link": {},
    "default_thumb": {
        "url": "https://t.mwm.moe/pc"
    },
    "loading_background": "gray",
    "route": {
        "home": "/",
        "post": "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2}\\.html)",
        "post-by-id": "/p/:id",
        "tag": "/tag/:tag",
        "category": "/category/:category",
        "search": "/search/:keyword(.*)",
        "page": "/p/:page(.*)"
    }
}
EOF
mkdir ./dist/data/post
cat <<EOF > ./dist/data/post/greet.md
# 欢迎使用OneBlog!
你的Blog已经可以使用了！Congratulations！
建议阅读一下readme哦
EOF;
cp ./readme.md ./dist/data/post/readme.md

# setup
wget -O deno.zip https://github.com/denoland/deno/releases/download/v2.1.9/deno-x86_64-unknown-linux-gnu.zip
unzip deno.zip
chmod +x deno
./deno run -A ./utils/update_index.ts