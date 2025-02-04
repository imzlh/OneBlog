import { computed, type ComputedRef, type Directive } from "vue";
import type { Post } from "./post";

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

export const vRender: Directive<HTMLElement, string> = {
    mounted(el, binding){
        el.shadowRoot || el.attachShadow({ mode: 'open' });
        el.shadowRoot!.innerHTML = binding.value;
    },

    updated(el, binding){
        el.shadowRoot!.innerHTML = binding.value;
    }
}

// 允许执行script
async function _initScript(el: HTMLElement){
    const scripts = el.querySelectorAll('script');
    for(const script of scripts){
        const src = script.getAttribute('src'),
            newScr = document.createElement('script');
        if(src){
            const fe = await fetch(src);
            if(!fe.ok) throw new Error('Failed to fetch script');
            const text = await fe.text();
            newScr.textContent = text;
        }else{
            newScr.textContent = script.textContent;
        }

        script.remove();
        el.appendChild(newScr);
    }
}
export const vJavaScript: Directive<HTMLElement, string> = {
    mounted(el){
        return _initScript(el);
    },
    updated(el){
        return _initScript(el);
    }
}