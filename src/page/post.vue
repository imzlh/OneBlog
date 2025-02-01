<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router';
    import { CONFIG } from '../main';
    import { generate_date, Post } from '../utils/post';
    import { computed, shallowRef, watch } from 'vue';
    import { color_by_char } from '../utils/color';
    import CommentCard, { type IRawComment } from '../components/comment-card.vue';

    const route = useRoute(),
        router = useRouter(),
        pid = computed(() => route.params.post || route.params.id);

    watch(pid, function(pid){
        if(typeof pid != 'string' || !Post.get(pid))
        router.push({ name: '404' })
    });

    // @ts-ignore
    const post = computed(() => Post.get(pid.value)!),
        comments = shallowRef<Array<IComment>>([]),
        content = shallowRef('稍等片刻');
    
    watch(post, function(post){
        post.get_comment().then(data => comments.value = data);
        post.get_html().then(data => content.value = data);
    }, { immediate: true });

    const post_comment = (comment: IRawComment) => post.value.post_comment(comment)
            .catch((e: Error) => alert(e.message))
            .then(() => post.value.get_comment().then(data => comments.value = data));
</script>

<template>
    <div class="post-container">
        <h1>{{ post.info.title }}</h1>
        <p>Published on {{ generate_date(post.info) }}</p>

        <div class="tags">
            <div v-for="tag in post.info.tags" :key="tag"
                :style="{ backgroundColor: color_by_char(tag) }"
            >{{ tag }}</div>
        </div>
        <hr>

        <!-- 文章内容 -->
        <div class="content" v-html="content"></div>

        <!-- 评论区 -->
        <div v-if="CONFIG.comment">
            <h2>Comments</h2>
            <CommentCard @comment="post_comment" />
        </div>
    </div>
</template>

<style lang="scss">
    .post-container {
        max-width: 40rem;
        margin: 0 auto;

        > h1{
            margin: 0 0 1rem 0;
            font-weight: 500;
            line-height: 1.2;
            font-size: 1.25rem;
        }

        > p{
            font-size: .9rem;
            color: rgb(145, 139, 139);
        }

        > .tags {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 1rem;

            > div {
                margin-right: 0.5rem;
                padding: 0.2rem 1rem;
                border-radius: 0.8rem;
                font-size: 0.85rem;
                text-transform: uppercase;
                color: #fff;

                &::before{
                    content: '# ';
                    font-weight: 700;
                }
            }
        }

        > hr {
            margin: .5rem 0;
            border: none;
            border-top: 1px solid #ccc;
        }

        > .content {
            line-height: 1.8;
            font-size: .95rem;
            font-weight: 400;
            color: #333;
            word-break: break-word;

            // 文章内容美化
            h1, h2, h3, h4, h5, h6 {
                margin: 2rem 0 1rem;
                font-weight: 600;
                line-height: 1.2;
            }
            p {
                margin: 1rem 0;
            }
            img {
                max-width: 100%;
                height: auto;
                margin: 1rem 0;
            }
            blockquote {
                margin: 1rem 0;
                padding: 0 1rem;
                border-left: .35rem solid #0b8492;
                color: #666;
            }
            pre {
                margin: 1rem 0;
                padding: 0.5rem;
                background-color: #f5f5f5;
                border-radius: 0.2rem;
                font-size: 0.9rem;
                line-height: 1.2;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            code {
                padding: 0.2rem 0.4rem;
                background-color: #f5f5f5;
                border-radius: 0.2rem;
                font-size: 0.9rem;
                color: #666;
            }
            a {
                color: #595454;
                text-decoration: none;
                border-bottom: dashed .1rem #11b85c;

                &:hover {
                    color: #11b85c;
                }
            }
            table {
                margin: 1rem 0;
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                font-size: 0.9rem;
                color: #666;

                thead{
                    background-color: #f5f5f5;
                    font-weight: 600;
                }

                tbody{
                    color: #6a6262;
                }

                th, td {
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                }
            }
        }
    }
</style>