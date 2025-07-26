<template>
    <div class="post-list-container" tabindex="1" @blur="activePost = null">
        <!-- 筛选控件 -->
        <div class="filter-controls">
            <div class="filter-row" style="width: 20%;">
                <Autofill
                    v-model="searchQuery"
                    :options="posts.map(p => p.title)"
                    placeholder="搜索文章标题..."
                    @select="searchQuery = $event as string"
                />
            </div>
            
            <div class="filter-row">
                <Autofill 
                    v-model="selectedCategory"
                    :options="['所有分类', allCategories]"
                    placeholder="选择分类"
                    @select="selectedCategory = $event == '所有分类' ? null : $event as string"
                />
            </div>
            
            <div class="filter-row">
                <Autofill 
                    v-model="tagQuery"
                    :options="allTags"
                    placeholder="选择标签"
                    @select="selectedTags.includes($event as string) || selectedTags.push($event as string); tagQuery = ''"
                />
                <div v-if="selectedTags.length" class="selected-tags">
                    <span v-for="tag in selectedTags" :key="tag" class="selected-tag">
                        {{ tag }}
                        <span @click.stop="selectedTags = selectedTags.filter(t => t !== tag)" class="remove-tag">×</span>
                    </span>
                </div>
            </div>
        </div>

        <div v-for="post in filteredPosts" :key="post.name" class="post-item" @click="toggleDetails(post.name, post)"
            @dblclick="emit('navigate', post)">
            <div class="post-header">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-meta">
                    <button class="delete-btn" @click.stop="handleDelete(post.name)">删除</button>
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
    import { computed, ref } from 'vue'
import Autofill from './autofill.vue';

    interface Props {
        posts: IPost[]
    }

    interface Emits {
        (e: 'navigate', post: IPost): void
        (e: 'delete', postName: string): void
    }

    const { posts } = defineProps<Props>()
    const emit = defineEmits<Emits>()

    // 筛选相关状态
    const searchQuery = ref('')
    const selectedCategory = ref<string | null>(null)
    const selectedTags = ref<string[]>([])
    const tagQuery = ref('')
    const dateRange = ref<[Date | null, Date | null]>([null, null])

    // 提取所有分类
    const allCategories = computed(() => {
        const categories = new Set<string>()
        posts.forEach(post => {
            if(post.category) categories.add(post.category)
        })
        return Array.from(categories)
    })

    // 提取所有标签
    const allTags = computed(() => {
        const tags = new Set<string>()
        posts.forEach(post => {
            post.tags?.forEach(tag => tags.add(tag))
        })
        return Array.from(tags)
    })

    // 筛选后的文章列表
    const filteredPosts = computed(() => {
        return posts.filter(post => {
            // 标题搜索
            if(searchQuery.value && !post.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
                return false
            }
            // 分类筛选
            if(selectedCategory.value && post.category !== selectedCategory.value) {
                return false
            }
            // 标签筛选
            if(selectedTags.value.length > 0 && 
               !selectedTags.value.every(tag => post.tags.includes(tag))) {
                return false
            }
            // 日期范围筛选
            if(dateRange.value[0] && post.created < dateRange.value[0].getTime()) {
                return false
            }
            if(dateRange.value[1] && post.created > dateRange.value[1].getTime()) {
                return false
            }
            return true
        })
    })

    const handleDelete = (postName: string) => {
        if(confirm('确定要删除这篇文章吗？')) {
            emit('delete', postName)
        }
    }

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

    .filter-controls {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: #f8f9fa;
        border-radius: 0.8rem;
        display: flex;
        gap: 1.2rem;
    }

    .filter-row {
        flex-grow: 1;
        background-color: white;
        border-radius: .2rem;
        padding: .25rem .75rem;
    }

    .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .selected-tag {
        background-color: #e8f0fe;
        color: #3a76d5;
        padding: 0.4rem 0.8rem;
        border-radius: 0.6rem;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
    }

    .remove-tag {
        margin-left: 0.4rem;
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
        color: #9e9e9e;
    }

    .remove-tag:hover {
        color: #d32f2f;
    }

    .delete-btn {
        margin-left: auto;
        padding: 0.3rem 0.8rem;
        background-color: #ffebee;
        color: #d32f2f;
        border: none;
        border-radius: 0.6rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }

    .delete-btn:hover {
        background-color: #ffcdd2;
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
