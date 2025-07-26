<template>
    <div class="blog-settings">
        <div class="settings-header">
            <h1 class="title">博客设置</h1>
            <p class="subtitle">配置您的博客基本信息和功能选项</p>
        </div>

        <form @submit.prevent="handleSave" class="settings-form">
            <!-- 基本信息 -->
            <section class="settings-section">
                <h2 class="section-title">基本信息</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">站点名称</label>
                        <input v-model="formData.title" type="text" class="form-input" placeholder="请输入站点名称" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">站点描述</label>
                        <textarea v-model="formData.description" class="form-textarea" placeholder="请输入站点描述"
                            rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">关键词</label>
                        <input v-model="formData.keywords" type="text" class="form-input" placeholder="多个关键词用英文逗号分隔" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">时间格式</label>
                        <input v-model="formData.format_time" type="text" class="form-input"
                            placeholder="Y-m-d H:i:s" />
                    </div>
                </div>
            </section>

            <!-- 评论设置 -->
            <section class="settings-section">
                <h2 class="section-title">评论设置</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <input v-model="formData.comment" type="checkbox" class="form-checkbox" />
                            启用评论功能
                        </label>
                    </div>
                    <div class="form-group" v-show="formData.comment">
                        <label class="form-label">每页评论数量</label>
                        <input v-model.number="formData.comment_per_page" type="number" class="form-input" min="1"
                            placeholder="10" />
                    </div>
                    <div class="form-group" v-show="formData.comment">
                        <label class="form-label">评论必填字段</label>
                        <div class="checkbox-group">
                            <label v-for="field in commentFields" :key="field" class="checkbox-item">
                                <input v-model="formData.comment_required" :value="field" type="checkbox"
                                    class="form-checkbox" />
                                {{ getFieldLabel(field) }}
                            </label>
                        </div>
                    </div>
                    <div class="form-group" v-show="formData.comment">
                        <label class="form-label">评论排序</label>
                        <select v-model="formData.comment_order" class="form-select">
                            <option value="asc">升序</option>
                            <option value="desc">降序</option>
                        </select>
                    </div>
                </div>
            </section>

            <!-- 显示设置 -->
            <section class="settings-section">
                <h2 class="section-title">显示设置</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">文章分页数量</label>
                        <input v-model.number="formData.post_per_page" type="number" class="form-input" min="1"
                            placeholder="10" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">图片加载背景</label>
                        <input v-model="formData.loading_background" type="text" class="form-input"
                            placeholder="图片URL或颜色值" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">默认缩略图类型</label>
                        <select v-model="thumbType" class="form-select" @change="updateThumbConfig">
                            <option value="single">单个图片</option>
                            <option value="seqnum">数字序列</option>
                            <option value="fixed">固定列表</option>
                        </select>
                    </div>

                    <!-- 动态缩略图配置 -->
                    <div class="form-group full-width" v-if="thumbType === 'single'">
                        <label class="form-label">缩略图URL</label>
                        <input v-model="singleThumbUrl" type="text" class="form-input" placeholder="thumb/default.webp"
                            @input="updateSingleThumb" />
                    </div>

                    <div class="form-group full-width" v-if="thumbType === 'seqnum'">
                        <div class="thumb-config">
                            <label class="form-label">序列配置</label>
                            <div class="thumb-grid">
                                <input v-model.number="seqConfig.range[0]" type="number" class="form-input"
                                    placeholder="起始数字" @input="updateSeqThumb" />
                                <input v-model.number="seqConfig.range[1]" type="number" class="form-input"
                                    placeholder="结束数字" @input="updateSeqThumb" />
                                <input v-model.number="seqConfig.pad" type="number" class="form-input"
                                    placeholder="填充长度" @input="updateSeqThumb" />
                                <input v-model="seqConfig.url" type="text" class="form-input"
                                    placeholder="thumb/%u.webp" @input="updateSeqThumb" />
                            </div>
                        </div>
                    </div>

                    <div class="form-group full-width" v-if="thumbType === 'fixed'">
                        <label class="form-label">缩略图列表</label>
                        <div class="url-list">
                            <div v-for="(url, index) in fixedUrls" :key="index" class="url-item">
                                <input v-model="fixedUrls[index]" type="text" class="form-input" placeholder="图片URL"
                                    @input="updateFixedThumb" />
                                <button type="button" @click="removeFixedUrl(index)" class="btn-remove"
                                    v-if="fixedUrls.length > 1">×</button>
                            </div>
                            <button type="button" @click="addFixedUrl" class="btn-add">+ 添加URL</button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 其他配置 -->
            <section class="settings-section">
                <h2 class="section-title">其他配置</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">ICP备案号</label>
                        <input v-model="formData.icp" type="text" class="form-input" placeholder="请输入ICP备案号" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Admin WebDAV路径</label>
                        <input v-model="formData.davroot" type="text" class="form-input" placeholder="/webdav/" />
                    </div>
                </div>
            </section>

            <!-- 保存按钮 -->
            <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="isSaving">
                    {{ isSaving ? '保存中...' : '保存设置' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { CONFIG as _config } from '../main'
import { update_config } from './driver';
const CONFIG = reactive(_config);

interface DefaultThumb {
    type?: 'seqnum' | 'fixed'
    range?: [number, number]
    pad?: number
    url?: string | string[]
}

type BlogConfig = Partial<typeof CONFIG>;

interface Emits {
    (e: 'update:modelValue', value: BlogConfig): void
    (e: 'save', value: BlogConfig): void
}

const emit = defineEmits<Emits>()

// 表单数据
const formData = reactive<BlogConfig>({
    title: '',
    description: '',
    keywords: '',
    format_time: 'Y-m-d H:i:s',
    comment: false,
    comment_per_page: 10,
    comment_required: [],
    comment_order: 'desc',
    post_per_page: 10,
    loading_background: '',
    default_thumb: { url: '', type: 'single', range: [], pad: 0 },
    icp: '',
    davroot: '',
})

// 状态
const isSaving = ref(false)
const commentFields = ['name', 'email', 'content', 'website']

// 缩略图相关
const thumbType = ref<'single' | 'seqnum' | 'fixed'>('single')
const singleThumbUrl = ref('')
const seqConfig = reactive({
    range: [0, 10] as [number, number],
    pad: 3,
    url: 'thumb/%u.webp'
})
const fixedUrls = ref<string[]>([''])

// 工具函数
const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
        name: '姓名',
        email: '邮箱',
        content: '内容',
        website: '网站'
    }
    return labels[field] || field
}

// 缩略图配置更新
const updateThumbConfig = () => {
    switch (thumbType.value) {
        case 'single':
            // @ts-ignore
            formData.default_thumb = { url: singleThumbUrl.value, type: 'single' }
            break
        case 'seqnum':
            formData.default_thumb = {
                type: 'seqnum',
                range: [...seqConfig.range],
                pad: seqConfig.pad,
                url: seqConfig.url
            }
            break
        case 'fixed':
            // @ts-ignore
            formData.default_thumb = {
                type: 'fixed',
                url: fixedUrls.value.filter(url => url.trim())
            }
            break
    }
}

const updateSingleThumb = () => {
    // @ts-ignore
    formData.default_thumb = { url: singleThumbUrl.value }
}

const updateSeqThumb = () => {
    formData.default_thumb = {
        type: 'seqnum',
        range: [...seqConfig.range],
        pad: seqConfig.pad,
        url: seqConfig.url
    }
}

const updateFixedThumb = () => {
    // @ts-ignore
    formData.default_thumb = {
        type: 'fixed',
        url: fixedUrls.value.filter(url => url.trim())
    }
}

const addFixedUrl = () => {
    fixedUrls.value.push('')
}

const removeFixedUrl = (index: number) => {
    fixedUrls.value.splice(index, 1)
    updateFixedThumb()
}

// 初始化缩略图配置
const initThumbConfig = (thumb?: DefaultThumb | { url: string }) => {
    if (!thumb) return

    if ('type' in thumb) {
        if (thumb.type === 'seqnum' && thumb.range && thumb.pad && thumb.url) {
            thumbType.value = 'seqnum'
            seqConfig.range = [...thumb.range]
            seqConfig.pad = thumb.pad
            seqConfig.url = thumb.url as string
        } else if (thumb.type === 'fixed' && Array.isArray(thumb.url)) {
            thumbType.value = 'fixed'
            fixedUrls.value = [...thumb.url]
        }
    } else if (thumb.url && typeof thumb.url === 'string') {
        thumbType.value = 'single'
        singleThumbUrl.value = thumb.url
    }
}

// 数据初始化
const initFormData = (config: BlogConfig) => {
    Object.assign(formData, {
        title: '',
        description: '',
        keywords: '',
        format_time: 'Y-m-d H:i:s',
        comment: false,
        comment_per_page: 10,
        comment_required: [],
        comment_order: 'desc',
        post_per_page: 10,
        loading_background: '',
        default_thumb: { url: '' },
        icp: '',
        davroot: '',
        ...config
    })

    // @ts-ignore
    initThumbConfig(formData.default_thumb)
}

// 事件处理
const handleSave = async () => {
    isSaving.value = true
    try {
        Object.assign(_config, formData);
        await update_config();
        alert('保存成功!');

        emit('save', formData)
        emit('update:modelValue', formData)
    } finally {
        isSaving.value = false
    }
}

// 监听props变化
watch(
    () => CONFIG,
    (newValue) => {
        if (newValue) {
            initFormData(newValue)
        }
    },
    { immediate: true, deep: true }
)

// 监听表单数据变化
watch(
    formData,
    (newValue) => {
        emit('update:modelValue', newValue)
    },
    { deep: true }
)

// 生命周期
onMounted(() => {
    initFormData(CONFIG || {})
})
</script>

<style scoped>
.blog-settings {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

.settings-header {
    text-align: center;
    margin-bottom: 3rem;
}

.title {
    font-size: 2.5rem;
    font-weight: 300;
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.subtitle {
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0;
}

.settings-form {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.settings-section {
    padding: 2rem;
    border-bottom: 1px solid #f1f1f1;
}

.settings-section:last-child {
    border-bottom: none;
}

.section-title {
    font-size: 1.3rem;
    font-weight: 500;
    margin: 0 0 1.5rem 0;
    color: #2c3e50;
    position: relative;
    padding-left: 1rem;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 1.2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
    padding: 0.75rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #fff;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.form-checkbox {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
    margin-bottom: 0;
}

.thumb-config .thumb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
}

.url-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.url-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.btn-remove {
    width: 32px;
    height: 32px;
    border: none;
    background: #e74c3c;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
}

.btn-remove:hover {
    background: #c0392b;
}

.btn-add {
    padding: 0.5rem 1rem;
    border: 2px dashed #ccc;
    background: transparent;
    color: #666;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.btn-add:hover {
    border-color: #667eea;
    color: #667eea;
}

.form-actions {
    padding: 2rem;
    background: #f8f9fa;
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-primary,
.btn-secondary {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #fff;
    color: #666;
    border: 2px solid #e9ecef;
}

.btn-secondary:hover {
    border-color: #667eea;
    color: #667eea;
}

@media (max-width: 768px) {
    .blog-settings {
        padding: 1rem;
    }

    .title {
        font-size: 2rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .thumb-config .thumb-grid {
        grid-template-columns: 1fr;
    }
}
</style>