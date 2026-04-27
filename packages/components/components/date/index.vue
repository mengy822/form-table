<template>
  <el-config-provider :locale="language">
    <el-time-picker
      v-if="isTime"
      v-model="bindValue"
      :is-range="dataFinal.dateType == 'timerange'"
      :placeholder="`请选择${dataFinal.label}`"
      :readonly="dataFinal.readonly"
      :disabled="dataFinal.disabled"
      :editable="dataFinal.editable"
      :clearable="data.isDefault ? false : dataFinal.clearable"
      :size="dataFinal.size ?? 'default'"
      :value-format="dataFinal.valueFormat"
      :format="dataFinal.format"
      :type="dataFinal.dateType"
      :range-separator="dataFinal.rangeSeparator ?? '-'"
      :start-placeholder="dataFinal.startPlaceholder ?? '开始日期'"
      :end-placeholder="dataFinal.endPlaceholder ?? '结束日期'"
      :disabled-date="dataFinal.disabledDate"
      :shortcuts="dataFinal.shortcuts"
      v-bind="$attrs"
      @blur="blur"
      @focus="dataFinal.focus"
      @clear="dataFinal.clear"
      @calendar-change="dataFinal.calendarChange"
      @panel-change="dataFinal.panelChange"
      @visible-change="dataFinal.visibleChange"
    >
      >
      <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
        <slot :name="name" v-bind="scopeData"></slot>
      </template>
    </el-time-picker>
    <el-date-picker
      v-else
      @change="change"
      ref="_ref"
      :class="`_class${dataFinal.prop}`"
      v-model="bindValue"
      :placeholder="`请选择${dataFinal.label}`"
      :readonly="dataFinal.readonly as boolean"
      :disabled="dataFinal.disabled as boolean"
      :editable="dataFinal.editable as boolean"
      :clearable="data.isDefault ? false : dataFinal.clearable"
      :size="dataFinal.size"
      :value-format="dataFinal.valueFormat"
      :format="dataFinal.format"
      :type="dataFinal.dateType"
      :range-separator="dataFinal.rangeSeparator ?? '-'"
      :start-placeholder="dataFinal.startPlaceholder ?? '开始日期'"
      :end-placeholder="dataFinal.endPlaceholder ?? '结束日期'"
      :disabled-date="dataFinal.disabledDate"
      @blur="blur"
      @focus="dataFinal.focus"
      @clear="dataFinal.clear"
      @calendar-change="dataFinal.calendarChange"
      @panel-change="dataFinal.panelChange"
      @visible-change="dataFinal.visibleChange"
      v-bind="$attrs"
    >
      <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
        <slot :name="name" v-bind="scopeData"></slot>
      </template>
    </el-date-picker>
  </el-config-provider>
</template>
<script lang="ts">
export default {
  name: 'MyDate',
}
</script>
<script setup name="date" lang="ts">
import { type PropType, computed, ref, useSlots } from 'vue'
import { ElDatePicker } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { dateInnerType } from '../form/types'
import { getName } from '../../js/utils'
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
const isTime = ref(false)
const setDefaultValue = (data: typeof dataFinal.value) => {
  if (data.isDefault) {
    const now = new Date()
    if (data.dateType!.indexOf('range') > -1) {
      //时间范围
      let nowString: string | string[] = now.format('YYYY-MM-DD') as string
      nowString = [
        new Date(nowString + ' 00:00:00').format(data.format) as string,
        new Date(nowString + ' 23:59:59').format(data.format) as string,
      ]
      // console.log(nowString);
      bindValue.value = nowString
    } else {
      bindValue.value = now.format(data.format) as string
    }
  }
}
const dataFinal = computed(() => {
  let data = { ...props.data }
  data.dateType = data.dateType ?? 'datetimerange'
  let format = 'YYYY-MM-DD'
  if ((data.dateType || '').indexOf('time') > -1) {
    format += ` HH:mm:ss`
  }
  isTime.value = data.dateType == 'time' || data.dateType == 'timerange'
  if (isTime) {
    format = `HH:mm:ss`
  }
  data.valueFormat = data.valueFormat ?? format
  data.format = data.format ?? data.valueFormat ?? format
  setDefaultValue(data)
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
    if (!props.modelValue || props.modelValue.length === 0) setDefaultValue(dataFinal.value)
    return typeof props.modelValue !== 'object'
      ? String(props.modelValue)
      : props.modelValue != null
      ? props.modelValue.map((item) => String(item))
      : props.modelValue
  },
  set(val) {
    change(val)
  },
})
const change = (e: typeof props.modelValue) => {
  if (Array.isArray(e) && (dataFinal.value?.dateType as string)?.indexOf('time') > -1) {
    if (e[0] === e[1]) {
      e[1] = e[1].split(' ')[0] + ' 23:59:59'
    }
  }
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  emits('update:modelValue', e)
}
const _ref = ref(null)
defineExpose({
  _ref,
})
</script>


<style scoped lang="scss"></style>
