<template>
  <el-config-provider :locale="language">
    <el-date-picker
      @change="change"
      ref="_ref"
      :class="`_class${dataFinal.prop}`"
      v-model="bindValue"
      :placeholder="`请选择${dataFinal.label}`"
      :readonly="dataFinal.readonly"
      :disabled="dataFinal.disabled"
      :editable="dataFinal.editable"
      :clearable="dataFinal.clearable"
      :size="dataFinal.size"
      :value-format="dataFinal.valueFormat"
      :format="dataFinal.format"
      :type="dataFinal.dateType"
      :range-separator="dataFinal.rangeSeparator ?? '-'"
      :start-placeholder="dataFinal.startPlaceholder ?? '开始日期'"
      :end-placeholder="dataFinal.endPlaceholder ?? '结束日期'"
      @blur="blur"
      @focus="dataFinal.focus"
      @clear="dataFinal.clear"
      @calendar-change="dataFinal.calendarChange"
      @panel-change="dataFinal.panelChange"
      @visible-change="dataFinal.visibleChange"
    >
      <template v-for="(_,name) in slots" #[getName(name)]="scopeData">
        <slot :name="name" v-bind="scopeData"></slot>
      </template>

    </el-date-picker>
  </el-config-provider>
</template>

<script setup name="date" lang="ts">
import { type PropType, computed, ref, useSlots } from 'vue'
import { ElDatePicker } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { dateInnerType } from '../form/types'
import {getName} from '../../js/utils'
const slots = useSlots()
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  data: {
    type: Object as PropType<dateInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Array<String>],
    default: '',
  },
})
const blur = (e: FocusEvent) => {
  // if (bindValue.value) {
  //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.remove('error')
  // } else {
  //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.add('error')
  // }
  dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e)
}
const dataFinal = computed(() => {
  let data = { ...props.data }

  data.valueFormat = data.valueFormat ?? 'YYYY-MM-DD'
  data.format = data.format ?? data.valueFormat ?? 'YYYY-MM-DD'
  data.change = data.change || function () {}
  data.blur = data.blur || function () {}
  data.focus = data.focus || function () {}
  data.clear = data.clear || function () {}
  data.calendarChange = data.calendarChange || function () {}
  data.panelChange = data.panelChange || function () {}
  data.visibleChange = data.visibleChange || function () {}
  return data
})
const emits = defineEmits(['update:modelValue'])
const bindValue = computed({
  get() {
    return typeof props.modelValue !== 'object'
      ? String(props.modelValue)
      : props.modelValue.map((item) => String(item))
  },
  set(val) {
    change(val)
  },
})
const change = (e: typeof props.modelValue) => {
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  emits('update:modelValue', e)
}
const _ref = ref(null)
defineExpose({
  _ref,
})
</script>


<style scoped lang="scss"></style>
