<script lang="ts" setup>
    import { computed } from 'vue';
    import PostCard from '../components/post-card.vue';
    import { Post } from '../utils/post';
    import { CONFIG } from '../main';
    import { useRoute } from 'vue-router';
    import { range } from '../utils/number';

    const $route = useRoute(),
        $current_page = computed(() => {
            let page = 1;
            if(typeof $route.query.page == 'string') page = parseInt($route.query.page);
            if(isNaN(page) || page < 1) page = 1;
            return page;
        }),
        $range = computed<[number, number]>(() => [
            ($current_page.value -1) * CONFIG.post_per_page, 
            $current_page.value * CONFIG.post_per_page
        ]),
        $posts = computed(() => $all_post.array.slice($range.value[0], $range.value[1])),
        $all_post = Post.get_all().sort_by_time(true).sort_by_order(),
        // @ts-ignore
        $nav = computed<Array<number | '...'>>(() => {
            // 页码仅显示当前一页前两页、后n叶，最后一页
            const total = Math.ceil($all_post.array.length / CONFIG.post_per_page);
            if(total <= 6)
                return range(1, total);
            else
                return [
                    ... $current_page.value >= 6 ? [ 1, '...' ] : [1],
                    ... range(
                        Math.max($current_page.value - 2, 2), 
                        Math.min($current_page.value + 2, total)
                    ),
                    ... $current_page.value == total - 6 ? [ total ] : ['...', total]
                ];
        });
</script>

<template>
    <div class="list-post">
        <div class="wrapper" v-for="post in $posts">
            <PostCard :post="post.info" /> 
        </div>
        <ul class="page-nav">
            <li v-if="$current_page > 1"
                @click="$router.push({ query: { page: $current_page - 1 } })"
            >&lt;</li>
            <li v-for="i in $nav"
                :active="i == $current_page"
                @click="i != '...' && $router.push({ query: { page: i } })"
            >{{ i }}</li>
            <li v-if="$current_page < $nav.length"
                @click="$router.push({ query: { page: $current_page + 1 } })"
            >&gt;</li>
        </ul>
    </div>
</template>

<style lang="scss">
    .list-post {
        > .wrapper {
            padding: 2rem 0;

            &:nth-child(even){
                background-color: #f7f7f7;
            }
        }
    }

    .page-nav {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
        list-style: none;
        padding: 0;

        > li {
            margin: 0 0.5rem;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 300;
            line-height: 1.5rem;
            user-select: none;

            &[active=true] {
                color: #42b983;
                font-weight: 500;
                font-size: 1.25rem;
            }

            &:hover{
                color: rgb(30, 127, 179);
            }
        }
    }
</style>