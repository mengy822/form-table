import Form from './components/Form/index.vue';
import Table from './components/Table/index.vue';
import TableV2 from './components/TableV2/index.vue';
import Detail from './components/Detail/index.vue';
import Edit from './components/Edit/index.vue';
import Import from './components/Edit/index.vue';
import Dialog from './components/Dialog/index.vue';
import UploadFile from './components/components/File/index.vue';
import type { inputInnerType, dateInnerType, selectInnerType, fileInnerType, switchInnerType, radioInnerType, checkboxInnerType } from './components/components/form/types';
import { parseTime } from './components/js/utils';
String.prototype.formatDate = function (fmt) {
  const date = new Date(this);
  return date.format(fmt);
};
Date.prototype.format = function (fmt) {
  const date = this;

  return parseTime(date, fmt);
};
export type MyTableInstance = InstanceType<typeof Table>;
export type MyFormInstance = InstanceType<typeof Form>;
export type MyEditInstance = InstanceType<typeof Edit>;
export type MyImportInstance = InstanceType<typeof Import>;
export type MyDetailInstance = InstanceType<typeof Detail>;
export type MyDialogInstance = InstanceType<typeof Dialog>;
export type MyUploadFileInstance = InstanceType<typeof UploadFile>;
export { inputInnerType, dateInnerType, selectInnerType, fileInnerType, switchInnerType, radioInnerType, checkboxInnerType };
// 导出My前缀的组件并添加明确类型注解
export const MyForm: typeof Form = Form;
export const MyTable: typeof Table = Table;
export const MyTableV2: typeof TableV2 = TableV2;
export const MyDetail: typeof Detail = Detail;
export const MyEdit: typeof Edit = Edit;
export const MyImport: typeof Import = Import;
export const MyDialog: typeof Dialog = Dialog;
export const MyUploadFile: typeof UploadFile = UploadFile;
