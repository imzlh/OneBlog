<script lang="ts" setup>
    import { markRaw } from 'vue';
    import { Post } from '../utils/post';
    import Postlist from './postlist.vue';
    import { useRouter } from 'vue-router';

    const $route = useRouter();
    function goto(post: IPost){
        $route.push({
            path: '/admin/post/',
            query: {
                pid: post.name
            }
        });
    }
</script>

<template>
    <div class="posts-wrapper">
        <h1>文章列表</h1>
        <Postlist :posts="Post.get_all().array.map(i => markRaw(i.info))" @navigate="goto" />
    </div>
</template>

<style lang="scss">
    .posts-wrapper {
        > h1{
            margin: 0;
            margin-left: 3rem;
            font-weight: 300;
            color: #4d9a8c;
            user-select: none;
        }
    }
</style>