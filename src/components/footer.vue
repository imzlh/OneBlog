<script lang="ts" setup>
    import { ref } from 'vue';
    import { CONFIG } from '../main';
    import { get_soup } from '../utils/soup';
    import { useRouter } from 'vue-router';
    import { Post } from '../utils/post';

    function build_link(link: string) {
        const url = new URL(link, location.href);
        url.searchParams.append('from', location.href);
        return url.href;
    }

    const soup = ref('');
    useRouter().afterEach(() => get_soup().then(s => soup.value = s));

    const posts = Post.get_all().sort_by_time(true).array.slice(0, 10);
</script>

<template>
    <footer>
        <div class="social_links">
            <a v-for="(link, name) in CONFIG.social_link" :key="link" 
                :href="build_link(link)" target="_blank"
            >{{ name }}</a>
        </div>
        <div class="wrapper">
            <div class="copyright">
                <h3>FRIEND LINK</h3>
                <div class="links">
                    <a v-for="(link, name) in CONFIG.friend_link" :href="build_link(link)" target="_blank">
                        {{ name }}
                    </a>
                </div>
                <hr>
                <p>{{ soup }}</p>
                <br>
                <p>
                    {{ CONFIG.icp }}
                    <br />
                    &copy; {{ new Date().getFullYear() }} {{ CONFIG.title }}
                    <br />
                    Powered by <a href="https://github.com/imzlh/OneBlog" target="_blank">OneBlog</a>
                </p>
            </div>

            <div class="posts">
                <h3>LATEST POSTS</h3>
                <div class="links">
                    <RouterLink v-for="post in posts" :key="post.info.name"
                        :to="{ name: 'post-by-id', params: { id: post.info.name } }"
                    >
                        {{ post.info.title }}
                    </RouterLink>
                </div>
            </div>

            <div class="tags">
                <h3>ALL TAGS</h3>
                <div class="tag-container">
                    <RouterLink v-for="tag in Post.get_all_tags()" class="link"
                        :key="tag" :to="{ name: 'tag', params: { tag } }"
                    >
                        {{ tag }}
                    </RouterLink>
                </div>
            </div>
        </div>
    </footer>
</template>

<style lang="scss">
    footer{
        background-color: rgb(250, 250, 250);

        > .social_links{
            text-align: center;
            border-bottom: solid .1rem #f2f2f2;

            > a{
                display: inline-block;
                text-decoration: none;
                color: #827f7f;
                font-size: .9rem;
                padding: 1.5rem 3rem;
                margin-bottom: -.1rem;
                transition: all .2s ease-in-out;

                &:hover{
                    border-bottom: .1rem solid #258bff;
                    color: black;
                }
            }
        }

        > .wrapper{
            max-width: 40rem;
            margin: auto;
            display: flex;
            gap: 2rem;
            padding: 3rem 0;

            > *{
                width: 33%;
                flex-shrink: 1;
            }

            a.link{
                font-size: .85rem;
                vertical-align: middle;
                margin: 0 .35rem;
                line-height: 1rem;

                &::before{
                    content: '# ';
                    color: rgb(6, 205, 138);
                    font-size: 1rem;
                }
            }

            a{
                color: #333;
                text-decoration: none;
                transition: color .2s ease-in-out;

                &:hover{
                    color: #007bff;
                }
            }

            h3{
                font-size: .9rem;
                padding: 0 0 .5rem 0;
                text-decoration: none;
                color: #5f5f5f;
                font-weight: 400;
            }

            hr{
                margin: 1.25rem .25rem;
            }

            p{
                font-size: .85rem;
                margin-bottom: 1rem;
                color: rgb(99, 95, 95);
                line-height: 1.2rem;
            }

            .tag-container{
                display: flex;
                flex-wrap: wrap;
                gap: .5rem;
            }

            .links{
                padding-left: .25rem;

                > a{
                    display: block;
                    font-size: .85rem;
                    line-height: 1.5rem;

                    // 单行
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }
</style>