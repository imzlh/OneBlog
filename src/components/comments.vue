<script lang="ts" setup>
    import Self from './comments.vue'

    const { comment, large } = defineProps<{ 
        comment: IComment,
        large: boolean
    }>()
</script>

<template>
    <div class="comment" v-if="large">
        <div class="user-info">
            <img :src="comment.avator" :alt="comment.name" />
            <a :href="comment.website">{{ comment.name }}</a>
        </div>
        <div class="comment-content" v-html="comment.content" />
        <div class="children">
            <Self v-for="child in comment.children" :comment="child" :large="false" />
        </div>
    </div>
    <div v-else class="flex">
        <img :src="comment.avator" :alt="comment.name" />
        <div class="comment-content">
            <a :href="comment.website">{{ comment.name }}</a>
            <div class="comment-content" v-html="comment.content" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .comment {
        border: .1rem solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: .5rem;
        background-color: #f9f9f9;
        transition: all.3s ease-in-out;

        a{
            color: #333;
            padding: .75rem .35rem;
            text-decoration: none;
            transition: all.3s ease-in-out;

            &:hover{
                color: #4eabde;
            }
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: .5rem;
            margin-bottom: .35rem;
            font-size: .85rem;
        }

        .comment-content {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 1rem;
        }

        .children {
            margin-left: 1rem;
        }

        img{
            width: 4rem;
            height: 4rem;
            padding: 1rem 1rem 1rem 0;
            border-radius: 3rem;
            overflow: hidden;
            object-position: center;
            object-fit: cover;

            flex-grow: 1;
            flex-shrink: 0;
        }

        .flex{
            display: flex;
        }
    }

    @media (max-width: 768px) {
        .comment {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: .5rem;
            background-color: #f9f9f9;
            transition: all.3s ease-in-out;

            img{
                width: 3rem;
                height: 3rem;
                padding: 1rem 0;
                border-radius: 3rem;
                overflow: hidden;
                object-position: center;
                object-fit: cover;
            }

            .user-info {
                margin-bottom: .5rem;
                font-size: .8rem;
            }

            .comment-content {
                font-size: .9rem;
                line-height: 1.4;
                margin-bottom: .5rem;
            }

            .children {
                margin-left: 0;
            }
        }
    }
</style>