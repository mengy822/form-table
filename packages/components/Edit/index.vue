<template>
    <MyDialog
      ref="myDialog"
      :top="top"
      :width="width"
      :title="isAdd ? title.add : title.edit"
      @before-close="handleClose"
    >
      <div
        class="editDialog"
        :style="`--editFormGridTemplateColumns:${editFormGridTemplateColumns};--editFormDisplay:${editFormDisplay};--gridTemplateColumns:${gridTemplateColumns};--display:${display};`"
      >
        <component
          v-if="leftFunDom"
          :is="getFunDomComponent({ prop: 'left', leftFunDom }, dynamicComputedMap, 'leftFunDom')"
        />
        <slot v-else name="left" :data="dynamicComputedMap"></slot>
        <el-form
          ref="formRef"
          class="editForm"
          :model="dynamicComputedMap"
          :inline="inline"
          :label-position="labelPosition"
          :label-width="labelWidth"
          :label-suffix="labelSuffix"
          :hide-required-asterisk="hideRequiredAsterisk"
          :require-asterisk-position="requireAsteriskPosition"
          :show-message="showMessage"
          :inline-message="inlineMessage"
          :status-icon="statusIcon"
          :validate-on-rule-change="validateOnRuleChange"
          :size="size"
          :disabled="disabled"
          :scroll-to-error="scrollToError"
          @submit.native.prevent="submitFun"
        >
          <div
            v-for="(columnItem, index) in columnFinal"
            :key="index"
            :class="`class_${index} editItems`" :style="{ gap: gap + 'px' }"
          >
            <div
              v-for="item in columnItem"
              :key="JSON.stringify(item)"
              :class="`class_${item.prop}`"
              :style="`width:calc(${(100 / desColumn) * item.span}% - ${item.span == desColumn ? 0 : (gap / desColumn) * item.span}px)`"
            >
              <component
                v-if="item.itemFunDom"
                :is="getFunDomComponent(item, dynamicComputedMap, 'itemFunDom')"
              />
              <slot v-else :name="`item_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap" :config="item">
                <el-form-item
                  :ref="(el: any) => dynamicCreateRef(el, item.prop)"
                  :label="item.label"
                  :prop="item.prop"
                  :class="item.class"
                  :rules="
                    (rules[item.prop] || []).map((item1) => {
                      item1.required =
                        typeof item.dynamicRequired === 'undefined' || (item.dynamicRequired && item.dynamicRequired(dynamicComputedMap));
                      return item1;
                    })
                  "
                  v-if="item.showFun && item.showFun(dynamicComputedMap)"
                >
                  <template #label v-if="slots[`label_${item.prop}`] || item.labelFunDom">
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap, 'labelFunDom')"
                    />
                    <slot
                      v-else
                      :name="`label_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>
                  <template #error v-if="slots[`error_${item.prop}`] || item.errorFunDom">
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap, 'errorFunDom')"
                    />
                    <slot
                      v-else
                      :name="`error_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>

                  <template #default>
                    <component
                      v-if="item.funDom"
                      :is="getFunDomComponent(item, dynamicComputedMap)"
                    />
                    <slot
                      v-else
                      :name="item.slotName || item.prop"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                      :config="item"
                    >
                      <Input
                        :data="item as inputInnerType"
                        v-if="item.type === 'input'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Input>
                      <MyDate
                        :data="item as dateInnerType"
                        v-if="item.type === 'date'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </MyDate>

                      <Select
                        :data="item as selectInnerType"
                        v-if="item.type === 'select'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Select>
                      <Switch
                        :data="item as switchInnerType"
                        v-if="item.type === 'switch'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Switch>
                      <CheckBox
                        :data="item as checkboxInnerType"
                        v-if="item.type === 'checkbox'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </CheckBox>
                      <Radio
                        :data="item as radioInnerType"
                        v-if="item.type === 'radio'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </Radio>
                      <MyFile
                        :data="item as fileInnerType"
                        v-if="item.type === 'file'"
                        v-model="dynamicComputedMap[item.prop]"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        @fileSizeError="item?.fileSizeError"
                        @fileTypeError="item?.fileTypeError"
                        @remove="item?.remove"
                      >
                        <template v-for="(_, name) in slots" #[getName(name,item.prop)]="scopeData">
                          <slot :name="name" v-bind="scopeData"></slot>
                        </template>
                      </MyFile>
                    </slot>
                  </template>
                </el-form-item>
              </slot>
            </div>
          </div>
          <component
            v-if="errorDataFunDom"
            :is="
              getFunDomComponent(
                { prop: 'errorData', errorDataFunDom },
                dynamicComputedMap,
                'errorDataFunDom'
              )
            "
          />
          <slot v-else name="errorData" :data="dynamicComputedMap"></slot>
        </el-form>
        <component
          v-if="rightFunDom"
          :is="
            getFunDomComponent({ prop: 'right', rightFunDom }, dynamicComputedMap, 'rightFunDom')
          "
        />
        <slot v-else name="right" :data="dynamicComputedMap"></slot>
      </div>

      <template #footer>
        <slot name="footer" :loading="loading" :data="dynamicComputedMap" :orginaData="dataFinal">
          <div class="dialog-footer">
            <slot
              name="submitFooter"
              :loading="loading"
              :data="dynamicComputedMap"
              :orginaData="dataFinal"
            >
              <el-button type="primary" @click="submitFun" :loading="loading">
                {{ isAdd ? submitButtonTxt.add : submitButtonTxt.edit }}
              </el-button>
            </slot>
            <el-button @click="cancelFun" :loading="loading"> {{ cancelButtonTxt }}</el-button>
          </div>
        </slot>
      </template>
      <!-- </el-dialog> -->
    </MyDialog>
</template>
<script lang="ts" setup name="MyEdit">
import { getName } from '../js/utils'
import {
  Component,
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  ref,
  type Ref,
  useAttrs,
  useSlots,
  useTemplateRef,
  VNode,
  watch,
} from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import MyDate from '../components/date/index.vue'
import MyFile from '../components/File/index.vue'
import Switch from '../components/switch/index.vue'
import MyDialog from '../Dialog/index.vue'

import type {
  checkboxInnerType,
  dateInnerType,
  inputInnerType,
  radioInnerType,
  selectInnerType,
  fileInnerType,
  switchInnerType,
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'
import { createRules } from '../utils/rules'
import { scrollTo } from '../utils/scroll-to'
import { MyDialogInstance } from '../../index'
import { useFunDom } from '../utils/funDom'

const myDialog = useTemplateRef<MyDialogInstance>('myDialog')
const top = ref('15vh')
const slots = useSlots()
const display = computed(() => {
  return slots['left'] || slots['right'] ? 'grid' : 'block'
})
const gridTemplateColumns = computed(() => {
  return `${slots['left'] ? 'auto ' : ''}1fr${slots['right'] ? ' auto' : ''}`
})
// 定义 Props 类型接口
interface FormDialogProps {

  /** 不需要触发变更检查的组件类型 */
  notNeedChangeCheck?: string[]

  /** 提交按钮文本 */
  submitButtonTxt?: { add: string; edit: string }

  /** 取消按钮文本 */
  cancelButtonTxt?: string

  /** 弹框宽度 */
  width?: string

  /** 弹框标题 */
  title?: { add: string; edit: string }

  /** 表单列配置（必填） */
  column: (
    | inputInnerType
    | switchInnerType
    | checkboxInnerType
    | radioInnerType
    | selectInnerType
    | dateInnerType
    | fileInnerType
  )[]

  /** 行内表单模式 */
  inline?: boolean

  /** 表单域标签位置 */
  labelPosition?: 'left' | 'right' | 'top'

  /** 标签长度 */
  labelWidth?: string | number

  /** 表单域标签后缀 */
  labelSuffix?: string

  /** 隐藏必填星号 */
  hideRequiredAsterisk?: boolean

  /** 星号位置 */
  requireAsteriskPosition?: 'left' | 'right'

  /** 是否显示错误信息 */
  showMessage?: boolean

  /** 以行内形式显示错误信息 */
  inlineMessage?: boolean

  /** 在输入框内显示反馈图标 */
  statusIcon?: boolean

  /** 是否在rules改变后立即触发 */
  validateOnRuleChange?: boolean

  /** 表单内组件尺寸 */
  size?: '' | 'large' | 'default' | 'small'

  /** 禁用所有组件 */
  disabled?: boolean

  /** 滚动到第一个错误表单 */
  scrollToError?: boolean

  /** 提示信息显示时长（毫秒） */
  duration?: number

  /** 操作成功提示文本 */
  message?: string

  /** 自动更新回调函数 */
  autoUpdate?: () => void
  status?: number | boolean | string
  code?: string
  /** 数据源格式配置（数据列表字段、总数字段） */
  dataConfig?: { data: string; status: string | number | boolean; code: string }
  /** 列数 */
  desColumn?: number
  /** 错误数据的渲染函数 */
  errorDataFunDom?: (
    data: any,
    prop: string,
    other?: {
      [key: string]: any
    }
  ) => VNode | Component
  /** 表单左侧的渲染函数 */
  leftFunDom?: (
    data: any,
    prop: string,
    other?: {
      [key: string]: any
    }
  ) => VNode | Component
  /** 表单右侧的渲染函数 */
  rightFunDom?: (
    data: any,
    prop: string,
    other?: {
      [key: string]: any
    }
  ) => VNode | Component
}

// 使用 withDefaults 定义 Props 并配置默认值
const props = withDefaults(defineProps<FormDialogProps>(), {
  dataConfig: () => ({ data: 'data', status: 200, code: 'code' }),
  //删除成功的状态码
  status: 200,
  //删除成功的状态码字段
  code: 'code',
  // 不需要变更检查的组件类型
  notNeedChangeCheck: () => ['input', 'inputNumber'],

  //列数
  desColumn: 1,
  // 按钮文本
  submitButtonTxt: () => ({ add: '提交', edit: '修改' }),
  cancelButtonTxt: '取消',

  // 弹框样式
  width: '50%',
  title: () => ({ add: '新增', edit: '编辑' }),

  // 表单列配置（必填项，不设置默认值）
  column: undefined,

  // 表单布局
  inline: false,
  labelPosition: 'right',
  labelWidth: 'auto',
  labelSuffix: '',

  // 表单验证
  hideRequiredAsterisk: false,
  requireAsteriskPosition: 'left',
  showMessage: true,
  inlineMessage: false,
  statusIcon: false,
  validateOnRuleChange: true,

  // 表单状态
  size: '',
  disabled: false,
  scrollToError: false,

  // 提示信息
  duration: 1500,
  message: '操作成功',

  // 自动更新回调
  autoUpdate: undefined,
})

const dataFinal = ref<{ [key: string]: any }>({})
const rules = ref<FormRules>({})

const editFormDisplay = ref()
const editFormGridTemplateColumns = ref()
const gap = ref<number>(20);
const columnFinal = computed<(typeof props.column)[]>(() => {
  // console.log(props.column)
  // rules.value = createRules(props.column, props.notNeedChangeCheck)
  const clu: (typeof props.column)[] = []
  props.column.map(
    (
      item:
        | inputInnerType
        | switchInnerType
        | checkboxInnerType
        | radioInnerType
        | selectInnerType
        | dateInnerType
        | fileInnerType
    ) => {
      item.showMessage = item.showMessage ?? true
      item.inlineMessage = item.inlineMessage ?? ''
      item.labelPosition = item.labelPosition ?? ''
      item.labelWidth = item.labelWidth ?? ''
      item.showFun = item.showFun ?? (() => true)
      item.disabled = item.disabled ?? false
      item.clearable = item.clearable ?? true
      // console.log(item.span,props.column)
      item.span = item.span ?? props.desColumn
      // typeof item.disabled === 'boolean'
      //   ? item.disabled
      //   : item.disabled && item.disabled(dynamicComputedMap.value)
      item.readonly = item.readonly ?? false
      // typeof item.readonly === 'boolean'
      //   ? item.readonly
      //   : item.readonly && item.readonly(dynamicComputedMap.value)
      item.type = item.type ?? 'input'
      if (clu[(item.column || 1) - 1]) {
        clu[(item.column || 1) - 1].push(item)
      } else {
        clu[(item.column || 1) - 1] = [item]
      }
    }
  )
  // editFormDisplay.value = clu.length > 1 ? 'grid' : 'block'
  // editFormGridTemplateColumns.value = Math.max(...props.column.map((item) => item.column || 1))
  return clu
})

watch(
  () => props.column.map((item) => `${item.prop}-${item.type}`).join('|'),
  (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }
    rules.value = createRules(props.column, props.notNeedChangeCheck);
    editFormDisplay.value = columnFinal.value.length > 1 ? 'grid' : 'block';
    editFormGridTemplateColumns.value = Math.max(...props.column.map((item) => item.column || 1));
  },
  { immediate: true }
);

const dynamicRefMap = ref<{ [name: string]: any }>({})
//动态创建表单ref
const dynamicCreateRef = (el: any, prop: string) => {
  dynamicRefMap.value[prop + 'Ref'] = el
}
let dynamicComputedFun: (
    prop: string,
    type: 'variable' | 'string' | 'array' | 'file' | '',
    aliases: string
  ) => void,
  dynamicComputedMap: Ref<{ [name: string]: any }>

const dialogVisible = ref<boolean>(false)
//窗口关闭前事件
const handleClose = (cb: () => void) => {
  if (loading.value === true) {
    console.warn('请稍等...')
    return
  }
  loading.value = false
  formRef.value.resetFields()
  dataFinal.value = {}

  cb()
  emits('close')
}
const attrs = useAttrs()
const attr = computed(() => {
  let attrLs = {}
  const injectAttr = {}
  // for (const element of Object.keys(attrs)) {
  //   // inject()
  // }
  attrLs = { ...injectAttr, ...attrs }
  return attrLs
})

const isAdd = ref(true)
const loading = ref(false)
const init = async (
  data:
    | {
        [key: string]: any
      }
    | Promise<any> = {},
  add: boolean | undefined = undefined,
  openCb: (dynamicComputedMap: any, initData: any) => void = () => {}
) => {
  // console.time('初始化标题')
  let finaldata = {}

  if (data instanceof Promise) {
    let res
    try {
      res = await data
    } catch (e) {
      openCb({}, {})
      return
    }
    if (res[props.dataConfig.code] === props.dataConfig.status) {
      finaldata = res[props.dataConfig.data]
    }
  } else {
    finaldata = { ...data }
  }
  if (typeof add === 'undefined') {
    isAdd.value = Object.keys(finaldata).length === 0
  } else {
    isAdd.value = add as boolean
  }
  // console.timeEnd('初始化标题')
  // console.time('初始化数据')
  dataFinal.value = { ...finaldata }
  // console.timeEnd('初始化数据')
  // console.time('注册数据事件')
  columnFinal.value.forEach((item1) => {
    item1.forEach((item) => {
      if (item.isDefault && typeof dataFinal.value[item.prop] === 'undefined') {
        let data = ''
        if (item.type === 'radio') {
          data = ((item as radioInnerType).options as Array<any>)[0].value
        }
        if (item.type === 'select' && !(item as selectInnerType).multiple) {
          data = ((item as selectInnerType).options as Array<any>)[0].value
        }
        if (item.type === 'switch') {
          data = (item as switchInnerType).activeValue as string
        }
        dataFinal.value[item.prop] = data
      }
    })
  })
  const { dynamicComputedFun: dynamicComputedFun1, dynamicComputedMap: dynamicComputedMap1 } =
    MyComputedData(dataFinal.value, dataFinal)
  dynamicComputedFun = dynamicComputedFun1
  dynamicComputedMap = dynamicComputedMap1

  for (const dataKey in finaldata) {
    dynamicComputedFun(dataKey, '', '')
  }
  // console.timeEnd('注册数据事件')
  // console.time('绑定数据')
  columnFinal.value.forEach(
    (
      item1: (
        | checkboxInnerType
        | selectInnerType
        | dateInnerType
        | inputInnerType
        | fileInnerType
      )[]
    ) => {
      item1.forEach((item) => {
        let f = false
        switch (item.type) {
          case 'date':
            if (((item as dateInnerType).dateType || '').indexOf('range') !== -1) {
              //时间范围根据aliases转成对应字段
              dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases as string)
            } else if (((item as dateInnerType).dateType || '').slice(-1) === 's') {
              //时间范围根据aliases转成对应字段
              dynamicComputedFun(item.prop, 'string', ',')
            } else {
              f = true
            }
            break
          case 'checkbox':
            if ((item as checkboxInnerType).valueType === 'string') {
              dynamicComputedFun(item.prop, 'string', ',')
            } else {
              f = true
            }
            break
          case 'select':
            if (
              !(item as selectInnerType).multiple &&
              (item as checkboxInnerType).valueType !== 'string'
            ) {
              f = true
            } else {
              //多选下拉转成逗号字符串
              dynamicComputedFun(item.prop, 'string', ',')
            }
            break
          case 'input':
            if (typeof (item as inputInnerType).multiple == 'undefined') {
              f = true
            } else if ((item as inputInnerType).multiple) {
              //根据aliases转成对应字段
              dynamicComputedFun(item.prop, 'variable', (item as inputInnerType).aliases as string)
            } else if ((item as inputInnerType).multiple == false) {
              //根据aliases转成对应字段
              dynamicComputedFun(item.prop, 'string', ',')
            }
            break
          case 'file':
            if (!(item as fileInnerType).multiple) {
              f = true
            } else if ((item as fileInnerType).multiple) {
              //根据aliases转成对应字段
              dynamicComputedFun(item.prop, 'file', (item as fileInnerType).aliases as string)
            }
            break
          default:
            f = true
        }
        if (f) {
          dynamicComputedFun(item.prop, '', '')
        }
      })
    }
  )
  // console.timeEnd('绑定数据')
  // console.time('打开窗口')
  myDialog.value?.init()
  nextTick(() => {
    scrollTo(0, 100, document.querySelector('.editDialog') as HTMLElement)
    openCb(dynamicComputedMap.value, dataFinal.value)
    formRef.value.clearValidate([])
  })
  // console.timeEnd('打开窗口')
}
const formRef = ref<ElFormInstance>()
// submit 事件的回调函数类型
type SubmitCallback = (flag: boolean | Promise<any>) => void

// 所有 Emit 事件的完整类型接口
interface MyEditEmits {
  (eventName: 'submit', data: any, callback: SubmitCallback): void

  (eventName: 'close'): void
}

const emits = defineEmits<MyEditEmits>()
const cancelFun = () => {
  dataFinal.value = {}
  formRef.value.clearValidate([])
  myDialog.value?.handleClose()
}
const updateData = (prop: string, data: any) => {
  dynamicComputedMap.value[prop] = data
  //formRef.value.validateField(prop)
  formRef.value?.clearValidate(prop)
}
const getData = (prop: string) => {
  return dynamicComputedMap.value[prop]
}

const submitFun = async () => {
  formRef.value?.validate((valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true
      emits(
        'submit',
        { ...dataFinal.value },
        async (
          flag: boolean | Promise<any> = true,
          cb: (flag: boolean, data: any[]) => void = () => {}
        ) => {
          if (flag instanceof Promise) {
            try {
              const res = await (flag as Promise<any>)
              flag = res[props.code] == props.status
              // console.log(props.status);
              cb && cb(true, res)
            } catch (e) {
              flag = false
              cb && cb(false, e as any)
            }
          }
          if (flag) {
            ElMessage({
              message: props.message,
              grouping: true,
              duration: props.duration,
              type: 'success',
              showClose: props.duration! > 0,
              onClose: () => {
                loading.value = false
                cancelFun()
                if (typeof props.autoUpdate != 'undefined') {
                  props.autoUpdate()
                }
              },
            })
          } else {
            loading.value = false
          }
        }
      )
    }
  })
}

const { getFunDomComponent, clearFunDomCache } = useFunDom(attrs)

onBeforeUnmount(() => {
  clearFunDomCache()
})

defineExpose({
  init,
  close: cancelFun,
  updateData,
  getData,
  submit: submitFun,
})
</script>

<style scoped lang="scss">
.editDialog {
  max-height: 50vh;
  overflow-y: auto;
  display: var(--display);
  grid-gap: 20px;
  grid-template-columns: var(--gridTemplateColumns);

  .el-form {
    display: var(--editFormDisplay);
    grid-gap: 20px;
    --form-cols: var(--editFormGridTemplateColumns);
    grid-template-columns: repeat(var(--form-cols), 1fr);
  }
}

.editItems {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}
</style>
