<script lang="ts" setup>
    import { get_thumb, generate_date } from '../utils/post';

    const { posts } = defineProps<{
        posts: IPost[];
    }>();
</script>

<template>
    <div class="list">
        <RouterLink :to="{ name: 'post-by-id', params: { id: post.name } }" class="card" v-for="post in posts"
            :key="post.created.toString()">
            <img :src="get_thumb(post)" :alt="post.title">
            <div class="more">
                <h1>{{ post.title }}</h1>
                <span class="time">{{ generate_date(post) }}</span>
            </div>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
    .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        justify-content: space-between;
        gap: 1rem;

        > .card {
            display: flex;
            gap: .8rem;
            border-radius: .5rem;
            box-shadow: .1rem .05rem .75rem rgba(0, 0, 0, 0.1);
            transition: transform 0.3s;
            height: 5rem;
            overflow: hidden;
            text-decoration: none;
            color: rgb(55, 52, 52);

            &:hover{
                transform: scale(1.05);
            }

            > img{
                width: 5rem;
                height: 5rem;
                flex-shrink: 0;
                object-fit: cover;
            }
    
            > .more{
                flex-grow: 1;
                padding-right: .5rem;

                > h1{
                    font-size: 1rem;
                    margin: .35rem 0;
                    line-height: 1.5rem;
                    max-height: 2.8rem;
                    overflow: hidden;
                    font-weight: 500;
                    color: #03553e;
                }

                > span{
                    font-size: 0.8rem;
                    color: #bdb3b3;
                    display: block;
                    text-align: right;
                }
            }
        }
    }
</style>