import { computed, type ComputedRef } from "vue";

export function debounceComputed<T>(func: () => T, wait = 1000): ComputedRef<T> {
    let lastCacheTime = Date.now();
    let cache: T | undefined = undefined; // 初始化 cache 为 undefined

    return computed(() => {
        const now = Date.now();
        if (now - lastCacheTime > wait || !cache) {
            try {
                // 缓存
                cache = func();
            } catch (e) {
                console.error('Computed function failed to execute', e);
            }
            lastCacheTime = now;
        }
        return cache!;
    });
}
