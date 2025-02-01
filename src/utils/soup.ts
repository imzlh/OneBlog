import { CONFIG } from "../main";

export async function get_soup(): Promise<string> {
    const { api_soup } = CONFIG;
    try{
        var response = await fetch(api_soup.url);
    }catch{
        return 'API不可用: 网络错误';
    }
    if (!response.ok) {
        return 'API不可用: HTTP错误';
    }

    switch(api_soup.type){
        case 'text':
            return await response.text();
        case 'json':
            const _data = await response.json();
            return _data[api_soup.key] || 'API未返回数据';
        case 'xml':
            const res = await response.text(),
                data = new DOMParser().parseFromString(res, 'text/xml').documentElement;
            return data.querySelector(api_soup.selector)?.textContent || 'API未返回数据';
        default:
            return 'API配置错误';
    }
}

    