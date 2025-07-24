<script lang="ts" setup>
    import { computed } from 'vue';
    import { Post } from '../utils/post';
    import { useRoute } from 'vue-router';
    import writePost from './write-post.vue';

    import { config } from '../../package.json';

    import './icon.css';
    import Posts from './posts.vue';
    import Comments from './comments.vue';
    import Setting from './setting.vue';

    function getWelcome() {
        const hour = new Date().getHours();
        switch(true){
            case 22 <= hour || hour < 4:
                return "凌晨好！快去睡个觉活力下一天吧";
            case 4 <= hour && hour < 6:
                return "晚上好！写一篇blog记录生活吧";
            case 6 <= hour && hour < 12:
                return "早上好！又是活力满满的每一天";
            case 12 <= hour && hour < 18:
                return "下午好！工作顺利，继续加油吧";
            case 18 <= hour && hour < 22:
                return "晚上好！依旧活力满满的每一天";
        }
    }

    const totalPost = Post.get_all().array.length,
        totalComment = 0;   // TODO: get total comment count

    const realpage = computed(() => {
        const route = useRoute().params.page;
        switch(route){
            case 'post':
                return writePost;
            case 'comment':
                return Comments;
            case 'posts':
                return Posts;
            case 'setting':
                return Setting;
            default:
                return undefined;
        }
    })
</script>

<template>
    <template v-if="config.admin">
        <router-link class="whereisme" to="/admin/index">
            OneBlog 管理后台
        </router-link>
        <div class="admin-container" v-if="!realpage">
            <div class="overview">
                <h1>{{ getWelcome() }}</h1>
                <div class="ov-grid">
                    <router-link to="/admin/posts">
                        <div class="num">
                            {{ totalPost }}
                        </div>
                        <p>文章总数</p>
                    </router-link>
                    <router-link to="/admin/comment">
                        <div class="num">
                            {{ totalComment }}
                        </div>
                        <p>评论总数</p>
                    </router-link>
                </div>
            </div>
            <div class="ov-action">
                <router-link to="/admin/post">
                    <button>
                        写文章
                    </button>
                </router-link>
                <router-link to="/admin/comment">
                    <button>
                        管理评论
                    </button>
                </router-link>
                <router-link to="/admin/posts">
                    <button>
                        管理文章
                    </button>
                </router-link>
                <router-link to="/admin/setting">
                    <button>
                        设置
                    </button>
                </router-link>
            </div>
        </div>
        <div class="admin-maincontent" v-else>
            <component :is="realpage"></component>
        </div>
    </template>
    <div class="admin-sorry" v-else>
        <svg fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M13 5.698a4.92 4.92 0 0 1-.904.525C11.022 6.711 9.573 7 8 7s-3.022-.289-4.096-.777A4.92 4.92 0 0 1 3 5.698V7c0 .374.356.875 1.318 1.313C5.234 8.729 6.536 9 8 9c.666 0 1.298-.056 1.876-.156-.43.31-.804.693-1.102 1.132A12.31 12.31 0 0 1 8 10c-1.573 0-3.022-.289-4.096-.777A4.92 4.92 0 0 1 3 8.698V10c0 .374.356.875 1.318 1.313C5.234 11.729 6.536 12 8 12h.027a4.548 4.548 0 0 0-.017.8A1.9 1.9 0 0 0 8 13c-1.573 0-3.022-.289-4.096-.777A4.916 4.916 0 0 1 3 11.698V13c0 .374.356.875 1.318 1.313C5.234 14.729 6.536 15 8 15c0 .363.097.704.266.997C8.178 16 8.089 16 8 16c-1.573 0-3.022-.289-4.096-.777C2.875 14.755 2 14.007 2 13V4c0-1.007.875-1.755 1.904-2.223C4.978 1.289 6.427 1 8 1s3.022.289 4.096.777C13.125 2.245 14 2.993 14 4v4.256a4.493 4.493 0 0 0-1.753-.249C12.787 7.654 13 7.289 13 7V5.698Zm-8.682-3.01C3.356 3.124 3 3.625 3 4c0 .374.356.875 1.318 1.313C5.234 5.729 6.536 6 8 6s2.766-.27 3.682-.687C12.644 4.875 13 4.373 13 4c0-.374-.356-.875-1.318-1.313C10.766 2.271 9.464 2 8 2s-2.766.27-3.682.687Z"/>
            <path d="M9 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2Z"/>
            <path fill-rule="evenodd" d="M12 10a1 1 0 0 0-1 1v1.5a.5.5 0 0 1-1 0V11a2 2 0 1 1 4 0v1.5a.5.5 0 0 1-1 0V11a1 1 0 0 0-1-1Z"/>
        </svg>
        <h1>管理后台未启用</h1>
        <p>请在package.json中配置"admin": true</p>
    </div>
</template>

<style lang="scss">
    .admin-sorry{
        text-align: center;
        margin: 5rem 0;
        color: #746363;

        > svg{
            width: 5rem;
            height: 5rem;
            margin-bottom: 1rem;
            fill: rgb(168, 106, 106);
        }
    }

    .whereisme{
        font-size: .95rem;
        max-width: 90vw;
        width: 50rem;
        margin: auto;
        margin-bottom: 3rem;

        display: block;
        text-decoration: none;
        color: rgb(122, 140, 143);
    }

    .admin-container{
        width: 50rem;
        max-width: 80vw;
        margin: auto;
        margin-bottom: 3rem;

        > .overview{
            > h1{
                margin: 4rem 1rem;
                color: #bec6df;
            }

            > .ov-grid{
                display: flex;
                margin-bottom: 1rem;
                gap: 1rem;

                > *{
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-color: rgb(252 252 255);
                    box-shadow: 0.1rem .15rem .6rem rgba(237, 235, 255, 0.781);
                    border-radius: .4rem;
                    padding: 1rem;

                    > .num{
                        font-size: 2rem;
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                    }

                    > p{
                        font-size: .9rem;
                        margin: 0;
                        color: #9f9090;
                    }
                }
            }
        }

        > .ov-action{
            display: flex;
            margin-top: 2rem;
            gap: 1rem;

            button{
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.5rem;
                color: #746363;
                background-color: transparent;
                cursor: pointer;
                font-size: 1rem;

                position: relative;

                &::before{
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: .3rem;
                    border: solid .1rem #d6d7fc;
                    opacity: 0;
                }

                @keyframes hover{
                    0%{
                        transform: scale(3);
                        opacity: 0;
                    }50%{
                        opacity: 1;
                    }100%{
                        transform: scale(1);
                    }
                }

                &:hover::before{
                    animation: hover .35s ease-in-out 1 forwards;
                }
            }
        }
    }

    .admin-maincontent{
        width: 55rem;
        max-width: 90vw;
        margin: auto;
        margin-bottom: 3rem;
        position: relative;
        min-height: 100vh;
    }
</style>