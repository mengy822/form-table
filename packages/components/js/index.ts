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
