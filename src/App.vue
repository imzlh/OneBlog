<script lang="ts" setup>
    import { CONFIG } from './main';
    import { onMounted, ref } from 'vue';
    import Footer from './components/footer.vue';
    import { useRouter } from 'vue-router';

    // 定义runScript函数，用于执行统计代码
    // @ts-ignore
    globalThis.runScript = (url: string) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.head.appendChild(script);
    };

    const hide_main = ref(false);
    onMounted(() => {
        let lastScrollTop = main.value!.scrollTop;
        main.value!.onscroll = () => {
            const changed = main.value!.scrollTop - lastScrollTop;
            if(changed < -20){
                hide_main.value = false;
            }else if(changed > 10){
                hide_main.value = true;
            }
            lastScrollTop = main.value!.scrollTop;
        };
        const statistic = new Function(CONFIG.statistic);
        useRouter().afterEach(() => {
            main.value!.scrollTo({ top: 0, behavior:'smooth' });
            statistic();
        });
    });
</script>

<script lang="ts">
    const main = ref<HTMLDivElement>();
    export function scrollTo(px: number){
        main.value!.scrollTo({
            top: px,
            behavior:'smooth'
        })
    }
</script>

<template>
    <div class="__header" :hide="hide_main">
        <div class="container">
            <RouterLink class="title"
                :to="{ name: 'home' }"
            >{{ CONFIG.title }}</RouterLink>
            <nav>
                <router-link to="/">首页</router-link>
                <router-link :to="{ name: 'search', params: { keyword: ' ' } }">搜索</router-link>
                <router-link :to="{ name: 'page', params: { path: 'index' } }">页面</router-link>
            </nav>
        </div>
    </div>
    <div class="__main" ref="main">
        <RouterView />
        <Footer />
    </div>
</template>

<style lang="scss">
    @font-face {
        font-family: 'Repair';
        src: url('/font/Repair-Regular.woff2') format('woff2');
    }

    body{
        margin: 0;
        overflow: hidden;

        > *{
            box-sizing: border-box;
        }
    }

    .__header{
        padding: .75rem 1rem;
        background-color: white;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        z-index: 100;
        box-shadow: 0 .1rem .75rem rgba(0,0,0,.15);
        box-sizing: border-box;
        transition: transform .3s;
        letter-spacing: .1rem;

        &[hide=true]{
            transform: translateY(-100%);
        }

        > .container{
            max-width: 50rem;
            width: 100%;
            margin: auto;

            > .title{
                font-size: 1.35rem;
                line-height: 2rem;
                margin: 0;
                display: inline-block;
                color: rgb(53, 50, 50);
                text-decoration: none;
            }

            > nav{
                float: right;
                display: flex;
                gap: .5rem;
                flex-grow: 1;

                > a{
                    font-size: 1rem;
                    text-decoration: none;
                    color: #333;
                    transition: all .2s;
                    padding: .5rem 1rem;

                    &:hover{
                        color: rgb(17, 174, 108);
                    }
                }
            }
        }
    }

    .__main{
        padding-top: 6rem;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>