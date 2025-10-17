import { isReactive, reactive } from 'vue';
import { FormItem } from './types';

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export const handleTree = <T>(data: any[], id?: string, parentId?: string, children?: string): T[] => {
    const config: {
        id: string;
        parentId: string;
        childrenList: string;
    } = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
    };

    const childrenListMap: any = {};
    const tree: T[] = [];
    for (const d of data) {
        const id = d[config.id];
        childrenListMap[id] = d;
        if (!d[config.childrenList]) {
            d[config.childrenList] = [];
        }
    }

    for (const d of data) {
        const parentId = d[config.parentId];
        const parentObj = childrenListMap[parentId];
        if (!parentObj) {
            tree.push(d);
        } else {
            parentObj[config.childrenList].push(d);
        }
    }
    return tree;
};
// 处理文件下载
export const handleFileDownload = async (response: Response) => {
    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'download';

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
};
// 核心请求函数
export const request = async (method: string, url: string | URL, data = null, isFileDownload = false) => {
    const config: RequestInit = {
        method,
        // headers: getAuthHeaders(),
        credentials: 'include'
    };

    if (data) {
        if (method === 'GET') {
            url += url + '?' + new URLSearchParams(data).toString();
        } else config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return isFileDownload ? handleFileDownload(response) : response.json();
};