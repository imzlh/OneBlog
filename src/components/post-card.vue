<script lang="ts" setup>
    import { CONFIG } from '../main';
    import { generate_date, get_thumb } from '../utils/post';

    const { post } = defineProps<{
        post: IPost
    }>();
</script>

<template>
    <RouterLink :to="{ name: 'post-by-id', params: { id: post.name } }" class="card">
        <div class="image" :style="{
            background: CONFIG.loading_background
        }">
            <img :src="get_thumb(post)" :alt="post.title" hidden @load="
                ($event.target as HTMLImageElement).hidden = false
                " />
        </div>
        <h2 v-html="post.title"></h2>
        <span class="time">Published on {{ generate_date(post) }}</span>
        <hr>
        <p>{{ post.outline }} ...</p>
        <button type="button">Read More</button>
    </RouterLink>
</template>

<style lang="scss" scoped>
    .card {
        padding: 1rem 0;
        cursor: pointer;
        width: 100%;
        max-width: 40rem;
        text-align: center;
        text-decoration: none;
        color: unset;
        display: block;
        margin: 1rem auto;

        > div.image{
            width: 100%;
            height: 15rem;
            position: relative;
            box-shadow: .05rem .1rem 0.5rem rgba(0, 0, 0, 0.15);
            transition: box-shadow 0.3s;
            overflow: hidden;
            border-radius: .35rem;

            &:hover{
                cursor: pointer;
                box-shadow: 0 .3rem .5rem #0000002d;
            }

            > img{
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        > h2{
            margin: 1rem 0;
            font-size: 1.35rem;
            font-weight: 400;
        }

        > hr{
            width: 4rem;
            margin: auto;
        }

        > .time{
            font-size: .8rem;
            color: #b1a8a8;
            display: block;
            margin-bottom: 1rem;
        }

        > button{
            padding: 0 1.5rem;
            border: solid 0.1rem rgb(159, 152, 152);
            border-radius: 3rem;
            background: none;
            color: rgb(159, 152, 152);
            line-height: 2rem;
            cursor: pointer;

            &::after{
                background-image: url('data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctcmlnaHQiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMSA4YS41LjUgMCAwIDEgLjUtLjVoMTEuNzkzbC0zLjE0Ny0zLjE0NmEuNS41IDAgMCAxIC43MDgtLjcwOGw0IDRhLjUuNSAwIDAgMSAwIC43MDhsLTQgNGEuNS41IDAgMCAxLS43MDgtLjcwOEwxMy4yOTMgOC41SDEuNUEuNS41IDAgMCAxIDEgOHoiLz48L3N2Zz4=');
                width: 1rem;
                height: 1rem;
                content: "";
                display: inline-block;
                margin: 0 0 -.2rem 0.5rem;
            }
        }

        > p{
            font-size: .9rem;
            color: #6e6565;
            word-break: break-all;
        }
    }
</style>