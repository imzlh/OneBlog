<script lang="ts" setup>
    import { reactive } from 'vue';
    import { Post } from '../utils/post';
    import List from '../components/list.vue';
    import { useRoute } from 'vue-router';
    import { debounceComputed } from '../utils/vue';

    const route = useRoute();
    const _prop = route.params,
        filter = reactive({
            tags: (_prop.tags || []) as string[],
            category: _prop.category instanceof Array ? _prop.category[0] : _prop.category || '',
            search: _prop.search instanceof Array ? _prop.search[0] : _prop.search || '',
        }),
        result = debounceComputed(() => 
            Post.select_by_condition(filter.category, filter.tags, filter.search)
            .sort_by_time()
            .sort_by_order()
        ),
        all_data = {
            tags: Post.get_all_tags(),
            category: Post.get_all_categories()
        };

    const ui = reactive({
        category: false
    })
</script>

<template>
    <div class="page-search">
        <div class="search">
            <div class="category" @click="ui.category = !ui.category">
                <div class="header">{{ filter.category || '所有分类' }}</div>
                <div class="select" :show="ui.category">
                    <div v-for="category in all_data.category" :key="category"
                        :selected="filter.category == category" @click="filter.category = category"
                    >
                        {{ category }}
                    </div>
                </div>
            </div>
            <input type="text" v-model="filter.search" placeholder="Search content">
        </div>

        <!-- 筛选条件 -->
        <div class="tags">
            <template v-for="tag in all_data.tags" :key="tag">
                <div :active="filter.tags.includes(tag)"
                    @click="filter.tags.includes(tag) ? filter.tags.splice(filter.tags.indexOf(tag), 1) : filter.tags.push(tag)"
                >
                    {{ tag }}
                </div>
            </template>
        </div>

        <!-- 结果展示 -->
        <List :posts="result.raw" />
    </div>
</template>

<style lang="scss">
    .page-search{
        max-width: 40rem;
        margin: 1rem auto;

        > .search {
            display: flex;
            align-items: center;
            gap: .8rem;
            flex-wrap: wrap;
            background-color: #f8f8f8;
            border-radius: 3rem;
            box-shadow: 0 .1rem .3rem rgba(0,0,0,.1);
            height: 3rem;

            > *{
                flex-shrink: 0;
            }

            > .category {
                position: relative;

                > .header {
                    background: linear-gradient(to bottom, #5d85b1, #3a7bdc);
                    line-height: 3rem;
                    padding: 0 1.25rem;
                    color: white;
                    cursor: pointer;
                    border-radius: 1.5rem;
                }

                > .select {
                    position: absolute;
                    top: 3.5rem;
                    left: 50%;
                    transform: translateX(-50%) translateY(-120%);
                    background-color: white;
                    border-radius: .2rem;
                    box-shadow: 0 .1rem .3rem rgba(0,0,0,.1);
                    z-index: 1;
                    padding: .35rem .35rem 0 .35rem;
                    max-height: 10rem;
                    opacity: 0;
                    height: 1rem;
                    width: 8rem;
                    transition: opacity .2s, height .5s, transform .2s;
                    overflow-x: hidden;
                    overflow-y: auto;

                    &[show=true] {
                        display: block;
                        height: 10rem;
                        opacity: 1;
                        transform: translateX(-50%);
                    }

                    > div {
                        padding: .2rem .5rem;
                        margin-bottom: .35rem;
                        border-radius: .3rem;
                        cursor: pointer;
                        transition: background-color .2s ease-in-out;

                        &:hover {
                            background-color: #f2f2f2;
                        }

                        &[selected=true] {
                            background-color: #ddfbff;
                        }
                    }
                }
            }

            > input{
                border: none;
                background-color: transparent;
                outline: none;
                font-size: 1em;
                line-height: 3rem;
                flex-grow: 1;
            }
        }

        > .tags{
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: .5rem;
            margin: 2rem 0 3rem 0;

            > div{
                padding: .2rem .75rem;
                border-radius: 3rem;
                box-shadow: .1rem .2rem .4rem rgba(0,0,0,.15);
                cursor: pointer;
                transition: all .2s ease-in-out;
                color: rgb(78, 71, 71);

                &:hover{
                    color: rgb(100, 100, 100);
                }

                &[active=true]{
                    background-color: #f2f2f2;
                    box-shadow: none;
                    transform: translate(.05rem, .1rem);
                }
            }
        }
    }
</style>