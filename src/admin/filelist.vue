<template>
    <div class="file-uploader">
        <!-- 拖拽区域 -->
        <div class="dropzone" :class="{ 'is-dragover': isDragover }" @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave" @drop.prevent="handleDrop">
            <div class="dropzone-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div class="drag-main">
                    <p>拖拽文件到此处或</p>
                    <button class="upload-btn" @click="triggerFileInput">选择文件</button>
                    <button class="upload-btn" @click="triggerPaste" v-if="hasClipboardData">从剪切板粘贴</button>
                    <input type="file" ref="fileInput" multiple @change="handleFileChange" style="display: none" />
                </div>
            </div>
        </div>

        <!-- 文件列表 -->
        <div class="file-list" v-if="fileList.length > 0">
            <div v-for="(file, index) in fileList" :key="file.id" class="file-item">
                <div class="file-info" @dblclick="file.fullPath && $emit('insert', file.fullPath, file.name)">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ Number.isNaN(file.size) ? '?' : formatFileSize(file.size) }}</span>
                    <span class="file-status">{{ file.status }}</span>
                </div>
                <div class="file-actions">
                    <button @click="removeFile(index)" class="action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { markRaw, reactive, ref } from 'vue'
    import { is_image } from '../utils/define';
    import { driver } from './driver';

    interface UploadFile {
        id: string
        file?: File
        name: string
        rawName: string
        size: number
        status: 'pending' | 'uploading' | 'success' | 'error'
        progress?: number,
        fullPath?: string
    }

    const $emit = defineEmits<{
            upload: [string, string, number],
            insert: [string, string],
            delete: [string, string]
        }>(),
        $prop = defineProps<{
            initialFiles?: string[]
        }>(),
        fileList = reactive(((
            $prop.initialFiles?.map(fullPath => ({
                fullPath,
                id: crypto.randomUUID(),
                name: fullPath.split('/').pop() || '',
                size: NaN,
                status: 'success',
            })
        )) ?? []) as UploadFile[]);
    const isDragover = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)

    defineExpose({
        getFiles(){
            return fileList.map(f => f.fullPath).filter(Boolean) as string[];
        }
    })

    // 实用工具：压缩图片
    async function compressImage(input: File, quality = .8, scale = 1): Promise<File> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = URL.createObjectURL(input);
        await new Promise(rs => img.onload = rs);
        URL.revokeObjectURL(img.src);
        canvas.width = scale * img.width;
        canvas.height = scale * img.height;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        let data, extension;
        try{
            data = await new Promise<Blob | null>(rs => canvas.toBlob(rs, 'image/webp', quality));
            if(!data) throw 0;
            extension = 'webp';
        }catch{
            data = await new Promise<Blob | null>(rs => canvas.toBlob(rs, 'image/jpeg', quality));
            extension = 'png';
        }
        if(!data) throw new Error('compressImage failed');
        const compressed = new File([data], `${input.name.replace(/\.\w+$/, '')}.${extension}`, {type: 'image/' + extension});
        return compressed;
    }

    // 触发文件选择
    const triggerFileInput = () => {
        fileInput.value?.click()
    }

    const hasClipboardData = !!navigator.clipboard;
    const triggerPaste = () => {
        if (hasClipboardData) {
            navigator.clipboard.read().then(async it => {
                const item = it[0];
                if (!item.types.includes('text')){
                    // upload
                    let guessedExt = (item.types[0] ?? 'text/plain').split('/')[1];
                    addFiles([new File([await item.getType(item.types[0])], crypto.randomUUID() + '.' + guessedExt)]);
                }
            });
        }
    }

    // 处理拖拽进入
    const handleDragOver = () => {
        isDragover.value = true
    }

    // 处理拖拽离开
    const handleDragLeave = () => {
        isDragover.value = false
    }

    // 处理文件放置
    const handleDrop = (e: DragEvent) => {
        isDragover.value = false
        if (e.dataTransfer?.files) {
            addFiles(Array.from(e.dataTransfer.files))
        }
    }

    // 处理文件选择
    const handleFileChange = (e: Event) => {
        const input = e.target as HTMLInputElement
        if (input.files) {
            addFiles(Array.from(input.files))
            input.value = '' // 重置input，允许重复选择相同文件
        }
    }

    async function uploadCorutine() {
        if(uploadingState) throw new Error('uploading');
        uploadingState = true;
        for(const file of fileList){
            if(file.status == 'pending' && file.file){
                file.status = 'uploading';
                file.progress = 0;

                try{
                    file.fullPath = await driver.upload_attachment(file.file, (loaded, total) => {
                        file.progress = loaded / total * 100;
                    });
                    file.status = 'success';
                    delete file.file;   // free memory

                    $emit('upload', file.fullPath, file.name, file.size);
                }catch(e){
                    console.error(e);
                    file.status = 'error';
                }
            }
        }
        uploadingState = false;
    }

    // 添加文件到列表
    let uploadingState = false;
    const addFiles = (files: File[]) => {
        files.forEach(async file => {
            // 检查是否已存在同名文件
            const exists = fileList.some(f => f.rawName === file.name)
            if (!exists) {
                // compress image
                const rawName = file.name;
                if (file.type.startsWith('image/') || is_image(file.name)){
                    file = await compressImage(file);
                }

                fileList.push({
                    id: generateFileId(file),
                    file: markRaw(file),
                    name: file.name,
                    size: file.size,
                    status: 'pending',
                    rawName
                });

                if(!uploadingState) uploadCorutine();
            }
        })
    }

    // 生成文件ID
    const generateFileId = (file: File): string => {
        return `${file.name}-${file.size}-${file.lastModified}`
    }

    // 移除文件
    const removeFile = (index: number) => {
        const el = fileList[index];
        fileList.splice(index, 1)
        if(el.fullPath && el.status === 'success')
            $emit('delete', el.fullPath, el.name);
    }

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
</script>

<style scoped>
.file-uploader {
    margin: 0 .75rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.dropzone {
    padding: 0 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
    background-color: white;
}

.dropzone.is-dragover {
    border-color: #b7c4da;
    background-color: rgba(77, 144, 254, 0.1);
}

.dropzone-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding-bottom: 1rem;
}

.dropzone-content svg {
    color: #dae1ed;
    margin-bottom: 0.5rem;
    margin-top: 1.5rem;
}

.upload-btn {
    background-color: #edf4ff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: .25rem .35rem;
}

.upload-btn:hover {
    background-color: #cdfcff;
}

.file-list {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;

    overflow-x: hidden;
    overflow-y: auto;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
    border-bottom: none;
}

.file-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
}

.file-info > * {
    flex-shrink: 1;
}

.file-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* max-width: 55%; */
}

.file-size {
    color: #666;
    font-size: 0.875rem;
}

.file-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background-color: #f0f0f0;
    color: #333;
}

.file-status.pending {
    background-color: #fff3cd;
    color: #856404;
}

.file-status.uploading {
    background-color: #cce5ff;
    color: #004085;
}

.file-status.success {
    background-color: #d4edda;
    color: #155724;
}

.file-status.error {
    background-color: #f8d7da;
    color: #721c24;
}

.action-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
}

.action-btn:hover {
    background-color: #f0f0f0;
    color: #333;
}
</style>
