<template>
    <div class="post-list-container" tabindex="1" @blur="activePost = null">
        <div v-for="post in posts" :key="post.name" class="post-item" @click="toggleDetails(post.name, post)"
            @dblclick="emit('navigate', post)">
            <div class="post-header">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-meta">
                    <span class="post-date">{{ formatDate(post.created) }}</span>
                    <span v-if="post.category" class="post-category">{{ post.category }}</span>
                </div>
            </div>

            <transition name="slide-fade">
                <div v-show="activePost === post.name" class="post-details">
                    <p v-if="post.outline" class="post-outline">{{ post.outline }}</p>
                    <div v-if="post.tags && post.tags.length" class="post-tags">
                        <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                    <div class="post-footer">
                        <span>最后修改: {{ formatDate(post.modified) }}</span>
                        <span v-if="post.attachment && post.attachment.length" class="attachments">
                            附件: {{ post.attachment.length }}个
                        </span>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    interface Props {
        posts: IPost[]
    }

    interface Emits {
        (e: 'navigate', post: IPost): void
    }

    const { posts } = defineProps<Props>()
    const emit = defineEmits<Emits>()

    const activePost = ref<string | null>(null)

    const toggleDetails = (postName: string, post: IPost) => {
        if(activePost.value == postName) emit('navigate', post);
        else activePost.value = postName;
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
</script>

<style scoped>
    .post-list-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        max-width: 80rem;
        margin: 0 auto;
        padding: 2rem;
    }

    .post-item {
        background-color: #ffffff;
        border-radius: 1.2rem;
        box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
        padding: 2rem;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .post-item:hover {
        transform: translateY(-0.2rem);
        box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.1);
    }

    .post-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .post-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .post-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.9rem;
        color: #666;
        line-height: 2rem;
    }

    .post-category {
        background-color: #f0f7ff;
        color: #1a73e8;
        padding: 0 0.6rem;
        border-radius: 0.6rem;
    }

    .slide-fade-enter-active,
    .slide-fade-leave-active {
        transition: all 0.3s ease;
        max-height: 500px;
        overflow: hidden;
    }

    .slide-fade-enter-from,
    .slide-fade-leave-to {
        opacity: 0;
        max-height: 0;
    }

    .post-outline {
        font-size: 1rem;
        color: #555;
    }

    .post-tags {
        margin-top: 1rem;
    }

    .tag {
        background-color: #e8f0fe;
        color: #3a76d5;
        padding: 0.2rem 0.6rem;
        border-radius: 0.6rem;
        margin-right: 0.5rem;
    }

    .post-footer {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #777;
    }

    .attachments {
        margin-left: 1rem;
    }
</style>
