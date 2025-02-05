import type { Directive } from "vue";

function copyCode(el: HTMLPreElement){
    const code = el.getElementsByTagName('code')[0].textContent;
    const msg = el.getElementsByClassName('copy-msg')[0];
    if(code)
        navigator.clipboard.writeText(code).then(() => {
            
            msg.textContent = '复制成功';
            setTimeout(() => msg.textContent = '复制' , 1000);
        }).catch(() => {
            msg.textContent = '复制失败';
            setTimeout(() => msg.textContent = '复制', 1000);
        });
}

function init(elCol: HTMLCollectionOf<HTMLPreElement>){
    for (let i = 0; i < elCol.length; i++) {
        const el = elCol[i];
        const elCopy = document.createElement('button');
        elCopy.innerHTML = `${/*<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-12a.5.5 0 0 0-.5-.5H12a.5.5 0 0 1 0-1h.5A1.5 1.5 0 0 1 14 2.5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-12A1.5 1.5 0 0 1 3.5 1H4a.5.5 0 0 1 0 1z"/>
    <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5"/>
</svg>*/''}<span class="copy-msg">复制</span>`;
        elCopy.onclick = () => copyCode(el);
        el.appendChild(elCopy);
    }
}

export const vCodeHelper: Directive<HTMLElement> = {
    mounted(el) {
        init(el.getElementsByTagName('pre'));
    },

    updated(el) {
        init(el.getElementsByTagName('pre'));
    }
}