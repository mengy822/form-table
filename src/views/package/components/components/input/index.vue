<template>
<el-config-provider :locale="language">
  <el-input
    :placeholder="'请输入' + dataFinal.label"
    v-model="bindValue"
    ref="_ref"
    :clearable="dataFinal.clearable??false"
    :class="`_class${dataFinal.prop}`"
    :type="dataFinal.inputType ?? 'text'"
    :maxlength="dataFinal.maxlength"
    :minlength="dataFinal.minlength"
    :show-word-limit="dataFinal.showWordLimit ?? false"
    :show-password="dataFinal.showPassword ?? false"
    :disabled="dataFinal.disabled ?? false"
    :size="dataFinal.size ?? 'default'"
    :prefix-icon="dataFinal.prefixIcon"
    :suffix-icon="dataFinal.suffixIcon"
    :rows="dataFinal.rows ?? 2"
    :autosize="dataFinal.autosize ?? false"
    :autocomplete="dataFinal.autocomplete ?? 'off'"
    :name="dataFinal.name"
    :readonly="dataFinal.readonly ?? false"
    :max="dataFinal.max"
    :min="dataFinal.min"
    :step="dataFinal.step"
    :resize="dataFinal.resize"
    :autofocus="dataFinal.autofocus ?? false"
    :form="dataFinal.form"
    :validate-event="dataFinal.validateEvent ?? true"
    :inputStyle="dataFinal.inputStyle ?? {}"
    @blur="blur"
    @focus="dataFinal.focus"
    @change="change"
    @input="dataFinal.input"
    @clear="dataFinal.clear"
  >
    <template v-for="(_,name) in slots" #[getName(name)]="scopeData">
      <slot :name="name" v-bind="scopeData"></slot>
    </template>
  </el-input>
</el-config-provider>
</template>
<script lang="ts">
export default {
    name: 'Input'
}
</script>
<script setup name="Input" lang="ts">
import {getName} from '../../js/utils'
import { type PropType, computed, ref, useSlots } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { inputInnerType } from '../form/types'
const slots=useSlots()
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  data: {
    type: Object as PropType<inputInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
})
const blur = (e:FocusEvent) => {

    // if (bindValue.value) {
    //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.remove('error')
    // } else {
    //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.add('error')
    // }
  dataFinal.value&&dataFinal.value.blur&&dataFinal.value.blur(e)
}
const dataFinal = computed<typeof props.data>(() => {
  let data = { ...props.data }
  data.change = data.change || function () {}
  data.blur = data.blur || function () {}
  data.focus = data.focus || function () {}
  data.clear = data.clear || function () {}
  data.input = data.input || function () {}
  return data
})


const emits = defineEmits(['update:modelValue'])
const bindValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    // if (props.modelValue != val) {
      change(val)
    // }
  },
})
const change = (e: typeof props.modelValue) => {
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  emits('update:modelValue', e)
}
const _ref = ref()
defineExpose({
  _ref,
})
</script>

<style scope lang='scss'>
.el-input__inner[type='number']::-webkit-outer-spin-button,
.el-input__inner[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}

.el-input__inner[type='number'] {
  -moz-appearance: textfield;
}
</style>
