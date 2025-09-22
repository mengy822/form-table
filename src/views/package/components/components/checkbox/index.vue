<template>
  <el-config-provider :locale="language">
    <el-checkbox-group
      v-model="bindValue"
      @change="change"
      ref="_ref"
      :size="dataFinal.size ?? ''"
      :class="`_class${dataFinal.prop}`"
      :disabled="dataFinal.disabled ?? false"
      :min="dataFinal.min ?? 0"
      :max="dataFinal.max ?? max"
      :text-color="dataFinal.textColor ?? '#ffffff'"
      :fill="dataFinal.fill ?? '#409eff'"
      :tag="dataFinal.tag ?? 'div'"
      :validate-event="dataFinal.validateEvent ?? true"
      v-bind="$attrs"
    >
      <template #default>
        <slot :name="`checkbox_${dataFinal.prop}`">
          <div v-if="props.type === 'checkbox'">
            <el-checkbox
              v-for="(item, index) in (typeof dataFinal.options==='number'?[]:dataFinal.options)"
              :key="JSON.stringify(item)"
              :label="item.label"
              :value="String(item.value ?? item.label)"
              :true-value="dataFinal.config?.trueValue"
              :false-value="dataFinal.config?.falseValue"
              :disabled="(dataFinal.config)?.disabled ?? false"
              :name="dataFinal.config?.name ?? ''"
              :checked="dataFinal.config?.checked ?? false"
              :border="dataFinal.config?.border"
              :size="dataFinal.config?.size ?? 'default'"
              :indeterminate="dataFinal.config?.indeterminate ?? false"
              :validate-event="dataFinal.config?.validateEvent ?? true"
              :tabindex="index"
              @change="dataFinal.config?.change"
              v-bind="$attrs"
            >
              {{ item.label }}
            </el-checkbox>
          </div>

          <div v-if="props.type === 'checkboxButton'">
            <el-checkbox-button
              v-for="item in (typeof dataFinal.options==='number'?[]:dataFinal.options)"
              :key="JSON.stringify(item)"
              :label="item.label"
              :value="String(item.value ?? item.label)"
              :true-value="dataFinal.config?.trueValue"
              :false-value="dataFinal.config?.falseValue"
              :disabled="dataFinal.config?.disabled ?? false"
              :name="dataFinal.config?.name ?? ''"
              :checked="dataFinal.config?.checked ?? false"
              v-bind="$attrs"
              >{{ item.label }}</el-checkbox-button
            >
          </div>
        </slot>
      </template>
    </el-checkbox-group>
  </el-config-provider>
</template>
<script lang="ts">
export default {
    name: 'checkbox'
}
</script>
<script setup name="checkbox" lang="ts">
import { ElCheckbox, ElCheckboxGroup, ElCheckboxButton } from 'element-plus'
import { type PropType, ref, computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { type checkboxInnerType } from '../form/types'
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  type: {
    type: String as PropType<'checkbox' | 'checkboxButton'>,
    default:'checkbox'
  },
  data: {
    type: Object as PropType<checkboxInnerType>,
    required:true
  },
  modelValue: {
    type: Array<String | Number>,
    default: () => [],
  },
})
const max=computed(()=>{
  let len=typeof dataFinal.value.options==='number'?dataFinal.value.options:dataFinal.value.options.length
  return len
})

const dataFinal = computed(() => {
  let data = { ...props.data }
  if (typeof data.options === 'number') {
    let option: { label: string; value: string | number }[] = []
    for (let i = 0; i < data.options; i++) {
      option.push({
        value: i,
        label: i + '',
      })
    }
    data.options = option
  }
  //设置默认值
  if (data.isDefault && data.options.length > 0) {
    let isDefault = data.options.find((item) => !item.disabled)
    bindValue.value=[(isDefault && isDefault.value) || '']
  }
  data.change = data.change || function () {}
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
const change = (value: typeof props.modelValue) => {
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(value)
  emits('update:modelValue', value)
}
const _ref = ref()
defineExpose({
  _ref,
})
</script>
