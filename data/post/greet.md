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