<script lang="ts" setup>
    import { ref, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { get_file } from '../main';
    import { config } from '../../package.json';
    import { vRender } from '../utils/vue';
    import { parseMd } from '../utils/post';

    const route = useRoute(),
        $content = ref('稍等');
    watch(() => route.params.path, async val => {
        if(!val) return;
        // 组合URL
        const url = get_file(config.page_dir + val + '.html');
        // 尝试获取
        const fe = await fetch(url);
        if(!fe.ok) return useRouter().push({ name: '404' });
        // markdown?
        const content = await fe.text();
        if(content.match(/^(?:\<script.*\><\/script\>\s*)?\<\!--\s*markdown\s*--\>/i))
            $content.value = await parseMd(content);
        else
            $content.value = content;
    }, { immediate: true });
</script>

<template>
    <div class="page-content" v-render="$content" />
</template>

<style lang="scss">
    .page-content {
        max-width: 40rem;
        margin: 0 auto;
        margin-bottom: 3rem;
        min-height: 80vh;
    }
</style>