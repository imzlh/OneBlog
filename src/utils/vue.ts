import { computed, type ComputedRef, type Directive } from "vue";

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

async function execScript(scr: HTMLScriptElement, shadowRoot: ShadowRoot){
    let text = scr.textContent;
    if (scr.src) {
        const fe = await fetch(scr.src);
        if(!fe.ok) throw new Error('Failed to fetch script');
        text = await fe.text();
    }
    const script = document.createElement('script');
    script.textContent = text;
    shadowRoot.appendChild(script);
}

function handleShadow(el: HTMLElement) {
    requestAnimationFrame(async () => {
        const scrs = el.shadowRoot?.querySelectorAll('script');
        // @ts-ignore store
        el.hasScript = !!scrs?.length;

        // render script
        const defer = [] as HTMLScriptElement[];
        for (const scr of scrs || []) {
            // defer: exec script after dom render
            if (scr.defer) defer.push(scr);

            // async: create async corutine to exec script
            if (scr.async) execScript(scr, el.shadowRoot!);

            // exec script immediately
            await execScript(scr, el.shadowRoot!);
        }

        // exec deferred script
        for (const scr of defer) execScript(scr, el.shadowRoot!);
    });
}

export const vRender: Directive<HTMLElement, string> = {
    mounted(el, binding){
        el.shadowRoot || el.attachShadow({ mode: 'open' });
        el.shadowRoot!.innerHTML = binding.value;

        handleShadow(el);
    },

    updated(el, binding){
        // @ts-ignore store
        if(el.hasScript) location.reload();   // prevent JS leak
        el.shadowRoot!.innerHTML = binding.value;

        handleShadow(el);
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