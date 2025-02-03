<script lang="ts" setup>
    import { reactive } from 'vue';
    import DOMPurity from 'dompurify';
    import { CONFIG } from '../main';

    export interface IRawComment {
        name: string;
        email: string;
        content: string;
        website: string;
    }

    const emit = defineEmits<{
        comment: [ IRawComment ]
    }>()

    const input = reactive<IRawComment>({
        name: '',
        email: '',
        content: '',
        website: ''
    });

    function block_xss(comment: IRawComment): IRawComment {
        DOMPurity.sanitize(comment.content, CONFIG.xss_config);
        return comment;
    }
</script>

<template>
    <div class="comment-card">
        <div class="user">
            <input type="text" v-model="input.name" placeholder="Name">
            <input type="email" v-model="input.email" placeholder="Email">
            <input type="text" v-model="input.website" placeholder="Website">
        </div>
        <textarea name="comment" v-model="input.content" placeholder="(Markdown supported)
Type your comment here..." />
        <button @click="emit('comment', block_xss(input))">Post Comment</button>
    </div>
</template>

<style scoped>
    .comment-card {
        background-color: #f9f9f9;
        border-radius: .35rem;
        box-shadow: 0 .1rem .4rem rgba(0,0,0,.1);
        padding: .35rem .75rem;
        position: relative;
        margin-bottom: 2rem;

        > .user {
            display: flex;
            padding: .35rem 0;
            color: rgb(73, 68, 68);
            gap: 1rem;

            > input{
                width: 33%;
                flex-shrink: 1;

                background: none;
                border: none;
                outline: none;
                font-size: .9rem;
                border-bottom: dashed .1rem #ccc;
                transition: all .3s ease-in-out;

                &:hover{
                    border-bottom-color: #45ca9e;
                }
            }
        }

        > textarea {
            width: 100%;
            box-sizing: border-box;
            height: 10rem;
            max-height: 15rem;
            overflow-x: hidden;
            overflow-y: auto;
            resize: vertical;
            margin-bottom: .5rem;
            padding: .75rem;
            font-size: .9rem;
            margin: 0;

            border: none;
            outline: none;
        }

        > button {
            background-color: #45ca9e;
            color: #fff;
            border: none;
            border-radius: 3rem;
            padding: .5rem 1rem;
            font-size: .85rem;
            cursor: pointer;
            transition: all .3s ease-in-out;
            
            position: absolute;
            bottom: 1.5rem;
            right: 1.75rem;

            &:hover{
                background-color: #31a886;
            }
        }
    }
</style>