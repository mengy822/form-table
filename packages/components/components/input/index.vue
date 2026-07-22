<template>
  <el-config-provider :locale="language">
    <el-input
      :placeholder="dataFinal.placeholder ? dataFinal.placeholder : '请输入' + dataFinal.label"
      v-model="bindValue"
      ref="_ref"
      :style="{ width: dataFinal.width }"
      :clearable="dataFinal.clearable ?? false"
      :class="`_class${dataFinal.prop}`"
      :type="dataFinal.inputType ?? 'text'"
      :maxlength="dataFinal.maxlength ?? 50"
      :minlength="dataFinal.minlength"
      :show-word-limit="dataFinal.showWordLimit ?? false"
      :show-password="dataFinal.showPassword ?? false"
      :disabled="dataFinal.disabled as boolean ?? false"
      :size="dataFinal.size ?? 'default'"
      :prefix-icon="dataFinal.prefixIcon"
      :suffix-icon="dataFinal.suffixIcon"
      :rows="dataFinal.rows ?? 2"
      :autosize="dataFinal.autosize ?? false"
      :autocomplete="dataFinal.autocomplete ?? 'off'"
      :name="dataFinal.name"
      :readonly="dataFinal.readonly as boolean ?? false"
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
      v-bind="$attrs"
    >
      <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
        <slot :name="name" v-bind="scopeData"></slot>
      </template>
    </el-input>
  </el-config-provider>
</template>
<script lang="ts">
export default {
  name: 'Input',
}
</script>
<script setup name="Input" lang="ts">
import { getName } from '../../js/utils'
import { type PropType, computed, ref, useSlots, nextTick, watch } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { inputInnerType } from '../form/types'
const slots = useSlots()
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
const blur = (e: FocusEvent) => {
  // if (bindValue.value) {
  //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.remove('error')
  // } else {
  //   document.querySelector(`._class${dataFinal.value.prop}`)?.classList.add('error')
  // }
  dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e)
}
const dataFinal = computed<typeof props.data>(() => {
  let data = { ...props.data }
  data.focus = data.focus || function () {}
  data.clear = data.clear || function () {}
  let defaultInputFun = (inputValue: string | number) => {
    data.input?.(inputValue)
  }
  let defaultChangeFun = (inputValue: string | number) => {
    data.change?.(inputValue)
  }
  let defaultBlurFun = (e: FocusEvent) => {
    data.blur?.(e)
  }
  if (data.inputType === 'numberRange') {
    data.inputType = 'text'
    defaultInputFun = (value: string | number) => {
      const maxIntegerDigits = data.integerPlaces || 10
      const maxDecimalDigits = data.decimalPlaces || 2
      let result = (value as string)
        // 去除非(数字、小数点、负号)
        .replace(/[^\d.-]/g, '')
        // 确保只有一个小数点
        .replace(/(\..*)\./g, '$1')
        // // 确保负号在开头且只有一个
        .replace(/(?!^-)-/g, '')
        // .replace(/^(-?)-/g, '$1');
        // // 处理整数部分
        .replace(
          new RegExp(`^(-?)0*(\\d{0,${maxIntegerDigits}})\\d*`),
          function (match, sign, digits) {
            if (digits === '' && /^0+$/.test(match.replace(/^-/, '').split('.')[0])) {
              return sign + '0'
            }
            return sign + (digits === '' ? '' : digits)
          }
        )
        // 处理小数部分
        .replace(new RegExp(`(\\.\\d{0,${maxDecimalDigits}})\\d*`, 'g'), '$1')
      const nochange = ['.', '-', '-.']
      if (nochange.indexOf(result) === -1) {
        let xsd = ''
        if (result.slice(result.length - 1) === '.') {
          xsd = '.'
        }
        result = result ? String(Number(result)) + xsd : result
      }
      bindValue.value = result //Number(result);
      data.input?.(result)
    }
    defaultBlurFun = (e: FocusEvent) => {
      const nochange = ['.', '-', '-.']
      if (nochange.includes(e?.target?.value)) bindValue.value = ''
      else bindValue.value = Number(e?.target?.value)
      data.blur?.(e)
    }
  }
  if (data.inputType === 'number') {
    defaultInputFun = (value: string | number) => {
      const min = data.min
      const max = data.max
      let result = Number(value)
      if (typeof min === 'number') {
        result = Math.max(result, min)
      }
      if (typeof max === 'number') {
        result = Math.min(result, max)
      }
      bindValue.value = result //Number(result);
      data.input?.(result)
    }
  }

  return { ...data, change: defaultChangeFun, blur: defaultBlurFun, input: defaultInputFun }
})

const emits = defineEmits(['update:modelValue'])
const bindValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    // if (props.modelValue != val) {
    updateModelValue(val)
    //change(val)
    // }
  },
})
watch(
  () => bindValue.value,
  () => {
    change(bindValue.value);
  }
);
const change = (e: typeof props.modelValue) => {
  nextTick(() => {
    dataFinal.value && dataFinal.value.change && dataFinal.value.change(e);
  });
};
const updateModelValue = (e: typeof props.modelValue) => {
  emits('update:modelValue', e);
};
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
