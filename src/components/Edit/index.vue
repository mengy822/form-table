<template>
  <el-config-provider :locale="language">
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd?title.add:title.edit"
      :width="width"
      ref="editDialog"
      :top="top"
      :before-close="handleClose"
    >
      <div class="editDialog">
        <el-form
          ref="formRef"
          :model="dynamicComputedMap"
          :rules="rules"
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
            <slot :name="`item_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap">
              <el-form-item
                :ref="(el:any) => dynamicCreateRef(el, item.prop)"
                :label="item.label"
                :prop="item.prop"
              >
                <template #label v-if="slots[`label_${item.prop}`]">
                  <slot :name="`label_${item.prop}`"  :prop="item.prop" :data="dynamicComputedMap"> </slot>
                </template>
                <template #error v-if="slots[`error_${item.prop}`]">
                  <slot :name="`error_${item.prop}`" :prop="item.prop" :data="dynamicComputedMap"></slot>
                </template>

                <template #default>
                  <slot :name="item.prop" :prop="item.prop" :data="dynamicComputedMap">
                    <Input
                      :data="item"
                      v-if="item.type === 'input'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Input>
                    <MyDate
                      :data="item"
                      v-if="item.type === 'date'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></MyDate>

                    <Select
                      :data="item"
                      v-if="item.type === 'select'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Select>
                    <Switch
                      :data="item"
                      v-if="item.type === 'switch'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></Switch>
                    <CheckBox
                      :data="item"
                      v-if="item.type === 'checkbox'"
                      v-model="dynamicComputedMap[item.prop]"
                    ></CheckBox>
                    <Radio
                      :data="item"
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
            <el-button type="primary" @click="submitFun"> {{ isAdd?submitButtonTxt.add:submitButtonTxt.edit }}</el-button>
            <el-button @click="cancelFun"> {{ cancelButtonTxt }}</el-button>
          </div>
        </slot>
      </template>
    </el-dialog>
  </el-config-provider>
</template>
<script lang="ts" setup name='MyEdit'>
import { ref, useSlots, computed, type PropType, nextTick, type Ref } from 'vue'
import type { FormRules } from 'element-plus'
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
const top = ref('15vh')
const slots=useSlots()
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
      return ['input']
    },
  },
  submitButtonTxt: {
    type: Object as PropType<{
      add: String
      edit: String
    }>,
    default: () => {
      return {
        add:'提交',
        edit:'修改'
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
        add:'新增',
        edit:'编辑'
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
})
const dataFinal = ref<{ [key: string]: any }>({})
const rules = ref<FormRules>({})
const columnFinal = computed(() => {
  return props.column.map((item: any) => {
    if (item.isRequired) {
      let required = null
      if (typeof item.isRequired === 'boolean') {
        rules.value[item.prop] = [
          {
            required: true,
            message: item.label + '不能为空',
            trigger: 'blur',
          },
        ]
        required = {
          required: true,
          message: item.label + '不能为空',
          trigger: 'change',
        }
      } else {
        rules.value[item.prop] = [
          {
            validator: item.isRequired,
            trigger: 'blur',
          },
        ]
        required = {
          validator: item.isRequired,
          trigger: 'change',
        }
      }
      if (required != null && props.notNeedChangeCheck.indexOf(item.prop) === -1) {
        if (rules.value[item.prop] && Array.isArray(rules.value[item.prop]))
          rules.value[item.prop].push(required)
      }
    }
    item.showMessage = item.showMessage ?? true
    item.inlineMessage = item.inlineMessage ?? ''
    item.labelPosition = item.labelPosition ?? ''
    item.labelWidth = item.labelWidth ?? ''
    return item
  })
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
  dataFinal.value = {}
  dialogVisible.value = false
}
const editDialog = ref(null)
const isAdd=ref(true)
const init = (data: object = {}) => {
  if(Object.keys(data).length>0){
    isAdd.value=false
  }
  dataFinal.value = { ...data }
  let { dynamicComputedFun: dynamicComputedFun1, dynamicComputedMap: dynamicComputedMap1 } =
    MyComputedData(data, dataFinal)
  dynamicComputedFun = dynamicComputedFun1
  dynamicComputedMap = dynamicComputedMap1
  props.column.forEach((item) => {
    let f = false
    switch (item.type) {
      case 'date':
        if (['years', 'dates'].indexOf((item as dateInnerType).dateType) > -1) {
          dynamicComputedFun((item as dateInnerType).prop, 'string', ',')
        } else if (((item as dateInnerType).dateType || '').indexOf('range') === -1) {
          f = true
        } else {
          dynamicComputedFun(
            (item as dateInnerType).prop,
            'variable',
            (item as dateInnerType).aliases || ''
          )
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
  dialogVisible.value = true
}
defineExpose({
  init,
})
const formRef = ref()
const emits = defineEmits(['submit'])
const cancelFun = () => {
  formRef.value.resetFields()
  dialogVisible.value = false
}
const submitFun = async () => {
  formRef.value?.validate((valid: boolean, fields: any) => {
    if (valid) {
      emits('submit', dataFinal.value)
    } else {
      console.log('error submit!', fields)
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
