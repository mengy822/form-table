<template>
  <el-config-provider :locale="language">
    <MyDialog
      ref="myDialog"
      :top="top"
      :width="width"
      :title="isAdd ? title.add : title.edit"
      @before-close="handleClose"
    >
      <div class="editDialog">
        <slot name="left" :data="dynamicComputedMap"></slot>
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
        >
          <div v-for="(columnItem, index) in columnFinal" :key="index" :class="`class_${index}`">
            <div
              v-for="item in columnItem"
              :key="JSON.stringify(item)"
              :class="`class_${item.prop}`"
            >
              <slot :name="`item_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap">
                <el-form-item
                  :ref="(el: any) => dynamicCreateRef(el, item.prop)"
                  :label="item.label"
                  :prop="item.prop"
                  :rules="
                    typeof item.dynamicRequired === 'undefined' ||
                    (item.dynamicRequired && item.dynamicRequired(dynamicComputedMap))
                      ? rules[item.prop]
                      : []
                  "
                  v-if="item.showFun && item.showFun(dynamicComputedMap)"
                >
                  <template #label v-if="slots[`label_${item.prop}`]">
                    <slot
                      :name="`label_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>
                  <template #error v-if="slots[`error_${item.prop}`]">
                    <slot
                      :name="`error_${item.prop}`"
                      :prop="item.prop"
                      :data="dynamicComputedMap"
                    ></slot>
                  </template>

                  <template #default>
                    <slot
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
                      ></Input>
                      <MyDate
                        :data="item as dateInnerType"
                        v-if="item.type === 'date'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      ></MyDate>

                      <Select
                        :data="item as selectInnerType"
                        v-if="item.type === 'select'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      ></Select>
                      <Switch
                        :data="item as switchInnerType"
                        v-if="item.type === 'switch'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      ></Switch>
                      <CheckBox
                        :data="item as checkboxInnerType"
                        v-if="item.type === 'checkbox'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      ></CheckBox>
                      <Radio
                        :data="item as radioInnerType"
                        v-if="item.type === 'radio'"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        v-model="dynamicComputedMap[item.prop]"
                      ></Radio>
                      <File
                        :data="item as fileInnerType"
                        v-if="item.type === 'file'"
                        v-model="dynamicComputedMap[item.prop]"
                        :disabled="
                          typeof item.disabled === 'function'
                            ? item.disabled(dynamicComputedMap)
                            : item.disabled
                        "
                        @fileSizeError="emits('fileSizeError')"
                        @fileTypeError="emits('fileTypeError')"
                      >
                      </File>
                    </slot>
                  </template>
                </el-form-item>
              </slot>
            </div>
          </div>
        </el-form>
        <slot name="right" :data="dynamicComputedMap"></slot>
      </div>

      <template #footer>
        <slot name="footer">
          <div class="dialog-footer">
            <el-button type="primary" @click="submitFun" :loading="loading">
              {{ isAdd ? submitButtonTxt.add : submitButtonTxt.edit }}
            </el-button>
            <el-button @click="cancelFun" :loading="loading"> {{ cancelButtonTxt }}</el-button>
          </div>
        </slot>
      </template>
      <!-- </el-dialog> -->
    </MyDialog>
  </el-config-provider>
</template>
<script lang="ts" setup name="MyEdit">
import { computed, nextTick, ref, type Ref, useAttrs, useSlots, useTemplateRef } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import MyDate from '../components/date/index.vue'
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
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createRules } from '../utils/rules'
import { scrollTo } from '../utils/scroll-to'
import { MyDialogInstance } from '@/components/FormTable'

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
  /** 语言配置 */
  language: Record<string, any>

  /** 不需要触发变更检查的组件类型 */
  notNeedChangeCheck: string[]

  /** 提交按钮文本 */
  submitButtonTxt: { add: string; edit: string }

  /** 取消按钮文本 */
  cancelButtonTxt: string

  /** 弹框宽度 */
  width: string

  /** 弹框标题 */
  title: { add: string; edit: string }

  /** 表单列配置（必填） */
  column: (
    | inputInnerType
    | switchInnerType
    | checkboxInnerType
    | radioInnerType
    | selectInnerType
    | dateInnerType
  )[]

  /** 行内表单模式 */
  inline: boolean

  /** 表单域标签位置 */
  labelPosition: 'left' | 'right' | 'top'

  /** 标签长度 */
  labelWidth: string | number

  /** 表单域标签后缀 */
  labelSuffix: string

  /** 隐藏必填星号 */
  hideRequiredAsterisk: boolean

  /** 星号位置 */
  requireAsteriskPosition: 'left' | 'right'

  /** 是否显示错误信息 */
  showMessage: boolean

  /** 以行内形式显示错误信息 */
  inlineMessage: boolean

  /** 在输入框内显示反馈图标 */
  statusIcon: boolean

  /** 是否在rules改变后立即触发 */
  validateOnRuleChange: boolean

  /** 表单内组件尺寸 */
  size: '' | 'large' | 'default' | 'small'

  /** 禁用所有组件 */
  disabled: boolean

  /** 滚动到第一个错误表单 */
  scrollToError: boolean

  /** 提示信息显示时长（毫秒） */
  duration: number

  /** 操作成功提示文本 */
  message: string

  /** 自动更新回调函数 */
  autoUpdate?: () => void
  status?: number | boolean | string
  code?: string
  /** 数据源格式配置（数据列表字段、总数字段） */
  dataConfig: { data: string; status: string | number | boolean; code: string }
}

// 使用 withDefaults 定义 Props 并配置默认值
const props = withDefaults(defineProps<FormDialogProps>(), {
  dataConfig: () => ({ data: 'data', status: 200, code: 'code' }),
  // 语言配置
  language: () => zhCn,
  //删除成功的状态码
  status: 200,
  //删除成功的状态码字段
  code: 'code',
  // 不需要变更检查的组件类型
  notNeedChangeCheck: () => ['input', 'inputNumber'],

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
  labelWidth: '120px',
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
//搜索条件标识,判断是不是需要重新渲染
const searchSign = ref<string[]>([])
/**
 * 计算搜索条件标识
 * @param list 搜索条件
 * @param flag true比较false计算
 */
const computedSearchSign = (list: typeof props.column = [], flag = false) => {
  if (flag) {
    return (
      new Set([...list.map((item) => `${item.prop}-${item.type}`), ...searchSign.value]).size !==
      searchSign.value.length
    )
  } else {
    searchSign.value = []
    searchSign.value = list.map((item) => `${item.prop}-${item.type}`)
  }
}
const editFormDisplay = ref()
const editFormGridTemplateColumns = ref()
const columnFinal = computed<(typeof props.column)[]>(() => {
  // computedSearchSign(props.column)
  rules.value = createRules(props.column, props.notNeedChangeCheck)
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
    ) => {
      item.showMessage = item.showMessage ?? true
      item.inlineMessage = item.inlineMessage ?? ''
      item.labelPosition = item.labelPosition ?? ''
      item.labelWidth = item.labelWidth ?? ''
      item.showFun = item.showFun ?? (() => true)
      item.disabled = item.disabled ?? false
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
  editFormDisplay.value = clu.length > 1 ? 'grid' : 'block'
  editFormGridTemplateColumns.value = Math.max(...props.column.map((item) => item.column || 1))
  return clu
})
const dynamicRefMap = ref<{ [name: string]: any }>({})
//动态创建表单ref
const dynamicCreateRef = (el: any, prop: string) => {
  dynamicRefMap.value[prop + 'Ref'] = el
}
let dynamicComputedFun: (
    prop: string,
    type: 'variable' | 'string' | 'array' | '',
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
    const res = await data
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
          data = (item as radioInnerType).options[0].value
        }
        if (item.type === 'select' && !(item as selectInnerType).multiple) {
          data = (item as selectInnerType).options[0].value
        }
        if (item.type === 'switch') {
          data = (item as switchInnerType).activeValue
        }
        dataFinal.value[item.prop] = data
      }
    })
  })
  const { dynamicComputedFun: dynamicComputedFun1, dynamicComputedMap: dynamicComputedMap1 } =
    MyComputedData(dataFinal.value, dataFinal)
  dynamicComputedFun = dynamicComputedFun1
  dynamicComputedMap = dynamicComputedMap1

  for (const dataKey in data) {
    dynamicComputedFun(dataKey, '', '')
  }
  // console.timeEnd('注册数据事件')
  // console.time('绑定数据')
  columnFinal.value.forEach((item1: (checkboxInnerType | selectInnerType | dateInnerType)[]) => {
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
          if (typeof item.multiple == 'undefined') {
            f = true
          } else if (item.multiple) {
            //根据aliases转成对应字段
            dynamicComputedFun(item.prop, 'variable', item.aliases as string)
          } else if (item.multiple == false) {
            //根据aliases转成对应字段
            dynamicComputedFun(item.prop, 'string', ',')
          }
          break
        default:
          f = true
      }
      if (f) {
        dynamicComputedFun(item.prop, '', '')
      }
    })
  })
  // console.timeEnd('绑定数据')
  // console.time('打开窗口')
  myDialog.value.init()
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
  formRef.value.clearValidate([])
  myDialog.value?.handleClose()
}
const updateData = (prop: string, data: any) => {
  dynamicComputedMap.value[prop] = data
  formRef.value.validateField(prop)
}
const getData = (prop: string) => {
  return dynamicComputedMap.value[prop]
}
defineExpose({
  init,
  close: cancelFun,
  updateData,
  getData,
})
const submitFun = async () => {
  formRef.value?.validate((valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true
      emits('submit', { ...dataFinal.value }, async (flag: boolean | Promise<any> = true) => {
        if (flag instanceof Promise) {
          try {
            const res = await (flag as Promise<any>)
            flag = res[props.code] == props.status
            // console.log(props.status);
          } catch (e) {
            flag = false
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
      })
    }
  })
}
</script>

<style scoped lang="scss">
.editDialog {
  max-height: 50vh;
  overflow-y: auto;
  display: v-bind(display);
  grid-gap: 20px;
  grid-template-columns: v-bind(gridTemplateColumns);
  .el-form {
    display: v-bind(editFormDisplay);
    grid-gap: 20px;
    grid-template-columns: repeat(v-bind(editFormGridTemplateColumns), 1fr);
    //v-bind(editFormGridTemplateColumns);
  }
}
</style>
