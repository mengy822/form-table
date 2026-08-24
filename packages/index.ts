// 导入工具函数

import * as utilHook from './components/utils/hooks'
import * as computedDataHook from './components/utils/hooks/MyComputedData.js'
import * as loadingHook from './components/utils/hooks/useLoadingCursor.js'
import { extendPrototypes } from './components/utils/prototype'

// 指令
import virualTable from './directive/virtualTable'
extendPrototypes()
// 导出 hooks
export const utilHooks = utilHook
export const loadingHooks = loadingHook
export const computedDataHooks = computedDataHook

// 导出指令
export const virual = virualTable

// 导出类型
export type {
  inputInnerType,
  dateInnerType,
  selectInnerType,
  fileInnerType,
  switchInnerType,
  radioInnerType,
  checkboxInnerType,
} from './components/components/form/types'

// ===== 组件导出（统一使用转发导出，最稳定）=====
export { default as MyForm } from './components/Form/index.vue'
export { default as MyTable } from './components/Table/index.vue'
export { default as MyTableV2 } from './components/TableV2/index.vue'
export { default as MyTableV3 } from './components/TableV3/index.vue'
export { default as MyDetail } from './components/Detail/index.vue'
export { default as MyEdit } from './components/Edit/index.vue'
export { default as MyImport } from './components/Import/index.vue' // ✅ 路径已修正
export { default as MyDialog } from './components/Dialog/index.vue'
export { default as MyEcharts } from './components/Echarts/index.vue'
export { default as MyMap } from './components/Map/index.vue'

// 子组件
export { default as MyInput } from './components/components/input/index.vue'
export { default as MySelect } from './components/components/select/index.vue'
export { default as MyCheckbox } from './components/components/checkbox/index.vue'
export { default as MySwitch } from './components/components/switch/index.vue'
export { default as MyRadio } from './components/components/radio/index.vue'
export { default as MyFile } from './components/components/File/index.vue'
export { default as MyDate } from './components/components/date/index.vue'
export { default as MyUploadFile } from './components/components/File/index.vue'
export { default as MyFormComponents } from './components/components/form/index.vue'
