import Form from './components/Form/index.vue';
import Table from './components/Table/index.vue';
import TableV2 from './components/TableV2/index.vue';
import TableV3 from './components/TableV3/index.vue';
import Detail from './components/Detail/index.vue';
import Edit from './components/Edit/index.vue';
import Import from './components/Edit/index.vue';
import Dialog from './components/Dialog/index.vue';
import UploadFile from './components/components/File/index.vue';
import Echarts from './components/Echarts/index.vue';
import type { inputInnerType, dateInnerType, selectInnerType, fileInnerType, switchInnerType, radioInnerType, checkboxInnerType } from './components/components/form/types';
import { parseTime } from './components/js/utils';
import * as utilHook from './components/utils/hooks'
import * as computedDataHook from './components/utils/hooks/MyComputedData.js'
import * as loadingHook from './components/utils/hooks/useLoadingCursor.js'
import virualTable from './directive/virtualTable'
String.prototype.formatDate = function (fmt) {
  const date = new Date(this);
  return date.format(fmt);
};
Date.prototype.format = function (fmt) {
  const date = this;

  return parseTime(date, fmt);
};
export const utilHooks = utilHook;
export const loadingHooks = loadingHook;
export const computedDataHooks = computedDataHook;

import Input from './components/components/input/index.vue'
import Select from './components/components/select/index.vue'
import Checkbox from './components/components/checkbox/index.vue'
import Switch from './components/components/switch/index.vue'
import Radio from './components/components/radio/index.vue'
import File from './components/components/File/index.vue'
import MDate from './components/components/date/index.vue'

// 导出组件类型
export type MyInputInstance = InstanceType<typeof Input>;
export type MySelectInstance = InstanceType<typeof Select>;
export type MyCheckboxInstance = InstanceType<typeof Checkbox>;
export type MySwitchInstance = InstanceType<typeof Switch>;
export type MyRadioInstance = InstanceType<typeof Radio>;
export type MyFileInstance = InstanceType<typeof File>;
export type MyDateInstance = InstanceType<typeof MDate>;
export type MyTableInstance = InstanceType<typeof Table>;
export type MyTableV2Instance = InstanceType<typeof TableV2>;
export type MyTableV3Instance = InstanceType<typeof TableV3>;
export type MyFormInstance = InstanceType<typeof Form>;
export type MyEditInstance = InstanceType<typeof Edit>;
export type MyImportInstance = InstanceType<typeof Import>;
export type MyDetailInstance = InstanceType<typeof Detail>;
export type MyDialogInstance = InstanceType<typeof Dialog>;
export type MyUploadFileInstance = InstanceType<typeof UploadFile>;
export type MyEchartsInstance = InstanceType<typeof Echarts>;
export { inputInnerType, dateInnerType, selectInnerType, fileInnerType, switchInnerType, radioInnerType, checkboxInnerType };
// 导出My前缀的组件并添加明确类型注解
export const MyInput: typeof Input = Input;
export const MySelect: typeof Select = Select;
export const MyCheckbox: typeof Checkbox = Checkbox;
export const MySwitch: typeof Switch = Switch;
export const MyRadio: typeof Radio = Radio;
export const MyFile: typeof File = File;
export const MyDate: typeof MDate = MDate;
export const MyForm: typeof Form = Form;
export const MyTable: typeof Table = Table;
export const MyTableV2: typeof TableV2 = TableV2;
export const MyTableV3: typeof TableV3 = TableV3;
export const MyDetail: typeof Detail = Detail;
export const MyEdit: typeof Edit = Edit;
export const MyImport: typeof Import = Import;
export const MyDialog: typeof Dialog = Dialog;
export const MyUploadFile: typeof UploadFile = UploadFile;
export const MyEcharts: typeof Echarts = Echarts;
export const virual = virualTable
