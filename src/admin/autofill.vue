<template>
    <div class="autocomplete-container">
        <div class="search-box">
            <input v-model="searchQuery" type="text" class="search-input" placeholder="请输入关键词..." @focus="showSuggestions = true"
                @blur="handleBlur" @keydown.down="moveDown" @keydown.up="moveUp" @keydown.enter="selectItem" />
        </div>

        <transition name="fade-slide">
            <div v-if="showSuggestions" class="suggestions-container">
                <div v-if="filteredOptions.length > 0" class="suggestions-list">
                    <div v-for="(item, index) in filteredOptions" :key="index" class="suggestion-item"
                        :class="{ highlighted: index === highlightedIndex }" @mousedown="selectItem(item)">
                        <slot name="item" :item="item">
                            <span v-html="highlightMatch(item)"></span>
                        </slot>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <slot name="empty">
                        <div class="empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <p>没有找到匹配的结果</p>
                    </slot>
                </div>
            </div>
        </transition>
    </div>
</template>
<script setup lang="ts">
    import { ref, computed, watch, type PropType } from 'vue'

    const props = defineProps({
        options: {
            type: Array as PropType<Array<string | Record<string, any>>>,
            default: () => [] as Array<string | Record<string, any>>
        },
        minChars: {
            type: Number,
            default: 1
        },
        clearAfterSelect: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits<{
        (e: 'select', item: string | Record<string, any>): void
    }>()

    const searchQuery = ref<string>('')
    const highlightedIndex = ref<number>(-1)
    const showSuggestions = ref<boolean>(false)

    const filteredOptions = computed<Array<string | Record<string, any>>>(() => {
        if (!searchQuery.value || searchQuery.value.length < props.minChars) return props.options;

        const query = searchQuery.value.toLowerCase()
        return props.options.filter(item => {
            const itemStr = typeof item === 'string' ? item : JSON.stringify(item)
            return itemStr.toLowerCase().includes(query)
        })
    })

    watch(searchQuery, _ => showSuggestions.value = false )

    function handleBlur(): void {
        setTimeout(() => {
            showSuggestions.value = false
        }, 200)
    }

    function moveDown(): void {
        if (highlightedIndex.value < filteredOptions.value.length - 1) {
            highlightedIndex.value++
            scrollToHighlighted()
        }
    }

    function moveUp(): void {
        if (highlightedIndex.value > 0) {
            highlightedIndex.value--
            scrollToHighlighted()
        }
    }

    function scrollToHighlighted(): void {
        const container = document.querySelector('.suggestions-list')
        const items = container?.querySelectorAll('.suggestion-item')
        if (items && items[highlightedIndex.value]) {
            items[highlightedIndex.value].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }
    }

    function selectItem(item?: string | Record<string, any>): void {
        const selected = item || filteredOptions.value[highlightedIndex.value]
        if (selected) {
            searchQuery.value = String(selected)
            emit('select', selected)
            showSuggestions.value = false
            if(props.clearAfterSelect) searchQuery.value = ''
        }
    }

    function highlightMatch(item: string | Record<string, any>): string {
        const itemStr = typeof item === 'string' ? item : JSON.stringify(item)
        const query = searchQuery.value.toLowerCase()
        const matchStart = itemStr.toLowerCase().indexOf(query)

        if (matchStart >= 0) {
            const before = itemStr.substring(0, matchStart)
            const match = itemStr.substring(matchStart, matchStart + query.length)
            const after = itemStr.substring(matchStart + query.length)
            return `${before}<span class="highlight">${match}</span>${after}`
        }
        return itemStr
    }
</script>

<style scoped>
    .autocomplete-container {
        position: relative;
    }

    .search-box {
        position: relative;
        /* border: .1rem solid #dfe1e5; */
        /* border-radius: .35rem; */
        /* padding: .25rem .45rem; */
        /* background: white; */
        /* box-shadow: 0 .05rem .1rem .4rem rgba(0, 0, 0, 0.1); */
    }

    .search-input {
        flex: 1;
        border: none;
        outline: none;;
        padding: .35rem 0;
        background: transparent;
    }

    .spinner {
        animation: rotate 2s linear infinite;
        width: 1rem;
        height: 1rem;
    }

    .path {
        stroke: #4d90fe;
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes dash {
        0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
        }

        50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
        }

        100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
        }
    }

    .suggestions-container {
        position: absolute;
        width: 10rem;
        max-height: 50vh;
        margin-top: 1rem;
        background: white;
        border-radius: .5rem;
        box-shadow: 0 .05rem .1rem .5rem rgb(248 248 255);
        overflow: hidden;
        z-index: 1000;
        left: -.25rem;
    }

    .suggestions-list {
        max-height: 50vh;
        overflow-y: auto;
    }

    .suggestion-item {
        padding: .5rem .75rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .suggestion-item:hover {
        background-color: #f5f8ff;
    }

    .suggestion-item.highlighted {
        background-color: #e8f0fe;
    }

    .highlight {
        font-weight: bold;
        color: #1a73e8;
    }

    .empty-state {
        padding: 1rem;
        text-align: center;
        color: #70757a;
    }

    .empty-icon {
        margin-bottom: 12px;
        color: #dadce0;
    }

    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.3s ease;
    }

    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }

    /* 滚动条样式 */
    .suggestions-list::-webkit-scrollbar {
        width: 8px;
    }

    .suggestions-list::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: .35rem;
    }

    .suggestions-list::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: .35rem;
    }

    .suggestions-list::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
</style>
