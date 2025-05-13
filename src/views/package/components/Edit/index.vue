<template>
  <el-config-provider :locale="language">
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? title.add : title.edit"
      :width="width"
      ref="editDialog"
      :top="top"
      :before-close="handleClose"
    >
      <div class="editDialog">
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
          <div
            v-for="item in columnFinal"
            :key="JSON.stringify(item)"
            :class="`class_${item.prop}`"
          >
            <slot
              :name="`item_${item.prop}`"
              :prop="item.prop"
              :data="dynamicComputedMap"
              :isShow="visible"
            >
              <el-form-item
                :ref="(el:any) => dynamicCreateRef(el, item.prop)"
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
                  <slot :name="`label_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap">
                  </slot>
                </template>
                <template #error v-if="slots[`error_${item.prop}`]">
                  <slot
                    :name="`error_${item.prop}`"
                    :prop="item.prop"
                    :data="dynamicComputedMap"
                  ></slot>
                </template>

                <template #default>
                  <slot :name="item.prop" :prop="item.prop" :data="dynamicComputedMap">
                    <Input
                      :data="(item as inputInnerType)"
                      v-if="item.type === 'input'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Input>
                    <MyDate
                      :data="(item as dateInnerType)"
                      v-if="item.type === 'date'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></MyDate>

                    <Select
                      :data="(item as selectInnerType)"
                      v-if="item.type === 'select'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Select>
                    <Switch
                      :data="(item as switchInnerType)"
                      v-if="item.type === 'switch'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Switch>
                    <CheckBox
                      :data="(item as checkboxInnerType)"
                      v-if="item.type === 'checkbox'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></CheckBox>
                    <Radio
                      :data="(item as radioInnerType)"
                      v-if="item.type === 'radio'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Radio>
                  </slot>
                </template>
              </el-form-item>
            </slot>
          </div>
        </el-form>
      </div>

      <template #footer>
        <slot name="footer">
          <div class="dialog-footer">
            <el-button type="primary" @click="submitFun" :loading="loading">
              {{ isAdd ? submitButtonTxt.add : submitButtonTxt.edit }}</el-button
            >
            <el-button @click="cancelFun" :loading="loading"> {{ cancelButtonTxt }}</el-button>
          </div>
        </slot>
      </template>
    </el-dialog>
  </el-config-provider>
</template>
<script lang="ts" setup name='MyEdit'>
import { ref, useSlots, computed, type PropType, nextTick, type Ref } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Input from '../components/input/index.vue'
import Select from '../components/select/index.vue'
import CheckBox from '../components/checkbox/index.vue'
import Radio from '../components/radio/index.vue'
import MyDate from '../components/date/index.vue'
import Switch from '../components/switch/index.vue'
import type {
  switchInnerType,
  checkboxInnerType,
  radioInnerType,
  dateInnerType,
  inputInnerType,
  selectInnerType,
} from '../components/form/types'
import MyComputedData from '../utils/hooks/MyComputedData'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createRules } from '../utils/rules'
import { scrollTo } from '../utils/scroll-to'
const top = ref('15vh')
const slots = useSlots()
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  notNeedChangeCheck: {
    type: Array<String>,
    default: () => {
      return ['input','inputNumber']
    },
  },
  submitButtonTxt: {
    type: Object as PropType<{
      add: String
      edit: String
    }>,
    default: () => {
      return {
        add: '提交',
        edit: '修改',
      }
    },
  },
  cancelButtonTxt: {
    type: String,
    default: '取消',
  },
  //弹框宽度
  width: {
    type: String,
    default: '50%',
  },
  //弹框标题
  title: {
    type: Object as PropType<{
      add: String
      edit: String
    }>,
    default: () => {
      return {
        add: '新增',
        edit: '编辑',
      }
    },
  },
  //列
  column: {
    type: Array<
      | inputInnerType
      | switchInnerType
      | checkboxInnerType
      | radioInnerType
      | selectInnerType
      | dateInnerType
    >,
    required: true,
  },
  //行内表单模式
  inline: {
    type: Boolean,
    default: false,
  },
  //表单域标签位置
  labelPosition: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: 'right',
  },
  //标签长度
  labelWidth: {
    type: [String, Number],
    default: '',
  },
  // 表单域标签后缀
  labelSuffix: {
    type: String,
    default: '',
  },
  //隐藏必填星号
  hideRequiredAsterisk: {
    type: Boolean,
    default: false,
  },
  //星号位置
  requireAsteriskPosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left',
  },
  //是否显示错误信息
  showMessage: {
    type: Boolean,
    default: true,
  },
  //以行内形式显示错误信息
  inlineMessage: {
    type: Boolean,
    default: false,
  },
  //在输入框内显示反馈图标
  statusIcon: {
    type: Boolean,
    default: false,
  },
  //是否在rules改变后立即触发
  validateOnRuleChange: {
    type: Boolean,
    default: true,
  },
  //表单内组件尺寸
  size: {
    type: String as PropType<'' | 'large' | 'default' | 'small'>,
    default: '',
  },
  //禁用所有组件
  disabled: {
    type: Boolean,
    default: false,
  },
  //滚动到第一个错误表单
  scrollToError: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    default: 1500,
    validator(value: number) {
      // The value must match one of these strings
      return value >= 0
    },
  },
  message: {
    type: String,
    default: '操作成功',
  },
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
const computedSearchSign = (list = [], flag = false) => {
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
const columnFinal = computed<
  Array<
    | inputInnerType
    | switchInnerType
    | checkboxInnerType
    | radioInnerType
    | selectInnerType
    | dateInnerType
  >
>(() => {
  // computedSearchSign(props.column)
  rules.value = createRules(props.column, props.notNeedChangeCheck)
  return props.column.map(
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
      return item
    }
  )
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
const handleClose = () => {
  if (loading.value === true) {
    console.warn('请稍等...')
    return
  }
  loading.value = false
  formRef.value.resetFields()
  dataFinal.value = {}
  dialogVisible.value = false
  emits('close')
}
const editDialog = ref(null)
const isAdd = ref(true)
const loading = ref(false)
const init = (data: object = {}, add: boolean | undefined = undefined) => {
  // console.time('初始化标题')
  if (typeof add === 'undefined') {
      isAdd.value = Object.keys(data).length === 0

  } else {
    isAdd.value = add as boolean
  }
  // console.timeEnd('初始化标题')
  // console.time('初始化数据')
  dataFinal.value = { ...data }
  // console.timeEnd('初始化数据')
  // console.time('注册数据事件')
  // if (!dynamicComputedFun && !dynamicComputedMap) {
    let { dynamicComputedFun: dynamicComputedFun1, dynamicComputedMap: dynamicComputedMap1 } =
      MyComputedData(data, dataFinal)
    dynamicComputedFun = dynamicComputedFun1
    dynamicComputedMap = dynamicComputedMap1
  // }
  // console.timeEnd('注册数据事件')
  // console.time('绑定数据')
  props.column.forEach((item) => {
    let f = false
    switch (item.type) {
      case 'date':
        if (((item as dateInnerType).dateType || '').indexOf('range') !== -1) {
          //时间范围根据aliases转成对应字段
          dynamicComputedFun(item.prop, 'variable', (item as dateInnerType).aliases)
        } else if (((item as dateInnerType).dateType || '').slice(-1) === 's') {
          //时间范围根据aliases转成对应字段
          dynamicComputedFun(item.prop, 'string', ',')
        }else {
          f = true
        }
        break
      case 'select':
        if (!(item as selectInnerType).multiple) {
          f = true
        } else {
          dynamicComputedFun((item as selectInnerType).prop, 'string', ',')
        }
        break
      case 'checkbox':
        dynamicComputedFun((item as checkboxInnerType).prop, 'string', ',')
        break
      default:
        f = true
    }
    if (f) {
      dynamicComputedFun(item.prop, '', '')
    }
  })
  // console.timeEnd('绑定数据')
  // console.time('打开窗口')
  dialogVisible.value = true
  nextTick(()=>{
    scrollTo(0,100,document.querySelector('.editDialog'))
  })
  // console.timeEnd('打开窗口')
}
const formRef = ref()
const emits = defineEmits(['submit', 'close'])
const cancelFun = () => {
  handleClose()
}
defineExpose({
  init,
  close: cancelFun,
})
const submitFun = async () => {
  formRef.value?.validate((valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true
      emits('submit', { ...dataFinal.value }, (flag = true) => {
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
            },
          })
        } else {
          loading.value = false
        }
      })
    } else {
    }
  })
}
</script>

<style scoped lang='scss'>
.editDialog {
  max-height: 50vh;
  overflow-y: auto;
}
</style>
