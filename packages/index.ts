import MyForm from './components/Form/index.vue';
import MyTable from './components/Table/index.vue';
import MyDetail from './components/Detail/index.vue';
import MyEdit from './components/Edit/index.vue';
import MyDialog from './components/Dialog/index.vue';
import type { inputInnerType, dateInnerType, selectInnerType, checkboxInnerType, switchInnerType, radioInnerType } from './components/components/form/types';
import { App } from 'vue';
const coms = [MyTable, MyForm, MyEdit, MyDetail, MyDialog]; // 将来如果有其它组件,都可以写到这个数组里

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
export type MyTableInstance = InstanceType<typeof MyTable>;
export type MyFormInstance = InstanceType<typeof MyForm>;
export type MyEditInstance = InstanceType<typeof MyEdit>;
export type MyDetailInstance = InstanceType<typeof MyDetail>;
export type MyDialogInstance = InstanceType<typeof MyDialog>;
export type { inputInnerType, dateInnerType, selectInnerType, checkboxInnerType, radioInnerType, switchInnerType };
// 导出My前缀的组件并添加明确类型注解
// export const MyForm: typeof Form = Form;
// export const MyTable: typeof Table = Table;
// export const MyDetail: typeof Detail = Detail;
// export const MyEdit: typeof Edit = Edit;
// export const MyDialog: typeof Dialog = Dialog;
export{
    MyForm, MyTable, MyDetail, MyEdit, MyDialog
}