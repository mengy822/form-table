import Form from './components/Form/index.vue';
import Table from './components/Table/index.vue';
import Detail from './components/Detail/index.vue';
import Edit from './components/Edit/index.vue';
import Dialog from './components/Dialog/index.vue';
import type { inputInnerType, dateInnerType, selectInnerType } from './components/components/form/types';
import { App } from 'vue';
const coms = [Table, Form, Edit, Detail,Dialog]; // 将来如果有其它组件,都可以写到这个数组里

// 批量组件注册

function capitalizeWord(word: string) {
    // 检查输入是否为字符串且不为空
    if (typeof word !== 'string' || word.length === 0) {
        return word
    }
    // 首字母大写，其余字母小写
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}
export default {
    install(app: App, prefix: string) {
        Object.entries(coms).forEach(([name, component]) => {
            app.component(`${capitalizeWord(prefix || 'My')}${name}`, component)
        })
    }
}
export type MyTableInstance = InstanceType<typeof Table>;
export type MyFormInstance = InstanceType<typeof Form>;
export type MyEditInstance = InstanceType<typeof Edit>;
export type MyDetailInstance = InstanceType<typeof Detail>;
export type MyDialogInstance = InstanceType<typeof Dialog>;
export type { inputInnerType, dateInnerType, selectInnerType };
// 导出My前缀的组件并添加明确类型注解
export const MyForm: typeof Form = Form;
export const MyTable: typeof Table = Table;
export const MyDetail: typeof Detail = Detail;
export const MyEdit: typeof Edit = Edit;
export const MyDialog: typeof Dialog = Dialog;
