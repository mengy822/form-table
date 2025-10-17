import Form from './Form/index.vue';
import Table from './Table/index.vue';
import Detail from './Detail/index.vue';
import Edit from './Edit/index.vue';
import Dialog from './Dialog/index.vue';
import UploadFile from './components/File/index.vue';
import type { inputInnerType, dateInnerType, selectInnerType } from '../form/types';

export type MyTableInstance = InstanceType<typeof Table>;
export type MyFormInstance = InstanceType<typeof Form>;
export type MyEditInstance = InstanceType<typeof Edit>;
export type MyDetailInstance = InstanceType<typeof Detail>;
export type MyDialogInstance = InstanceType<typeof Dialog>;
export type MyUploadFileInstance = InstanceType<typeof UploadFile>;
export { inputInnerType, dateInnerType, selectInnerType };
// 导出My前缀的组件并添加明确类型注解
export const MyForm: typeof Form = Form;
export const MyTable: typeof Table = Table;
export const MyDetail: typeof Detail = Detail;
export const MyEdit: typeof Edit = Edit;
export const MyDialog: typeof Dialog = Dialog;
export const MyUploadFile: typeof UploadFile = UploadFile;
