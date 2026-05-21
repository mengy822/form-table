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
              v-for="(item, index) in typeof dataFinal.options === 'number'
                ? []
                : dataFinal.options"
              :key="JSON.stringify(item)"
              :label="item[keyConfig.label]"
              :value="item[keyConfig.value] ?? item[keyConfig.label]"
              :true-value="dataFinal.config?.trueValue"
              :false-value="dataFinal.config?.falseValue"
              :disabled="item.disabled ?? dataFinal.config?.disabled ?? false"
              :name="dataFinal.config?.name ?? ''"
              :checked="dataFinal.config?.checked ?? false"
              :border="dataFinal.config?.border"
              :size="dataFinal.config?.size ?? 'default'"
              :indeterminate="dataFinal.config?.indeterminate ?? false"
              :validate-event="dataFinal.config?.validateEvent ?? true"
              :tabindex="index"
              @change="dataFinal.config?.change"
            >
              {{ item[keyConfig.label] }}
            </el-checkbox>
          </div>

          <div v-if="props.type === 'checkboxButton'">
            <el-checkbox-button
              v-for="item in typeof dataFinal.options === 'number' ? [] : dataFinal.options"
              :key="JSON.stringify(item)"
              :label="item[keyConfig.label]"
              :value="item[keyConfig.value] ?? item[keyConfig.label]"
              :true-value="dataFinal.config?.trueValue"
              :false-value="dataFinal.config?.falseValue"
              :disabled="item.disabled ?? dataFinal.config?.disabled ?? false"
              :name="dataFinal.config?.name ?? ''"
              :checked="dataFinal.config?.checked ?? false"
              >{{ item[keyConfig.label] }}</el-checkbox-button
            >
          </div>
        </slot>
      </template>
    </el-checkbox-group>
  </el-config-provider>
</template>
<script lang="ts">
export default {
  name: 'checkbox',
}
</script>
<script setup name="checkbox" lang="ts">
import { ElCheckbox, ElCheckboxGroup, ElCheckboxButton } from 'element-plus'
import { type PropType, ref, computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { type checkboxInnerType } from '../form/types'
import { checkExistence } from '@/components/js/utils'
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  type: {
    type: String as PropType<'checkbox' | 'checkboxButton'>,
    default: 'checkbox',
  },
  data: {
    type: Object as PropType<checkboxInnerType>,
    required: true,
  },
  modelValue: {
    type: Array<String | Number>,
    default: () => [],
  },
})
const max = computed(() => {
  let len =
    typeof dataFinal.value.options === 'number'
      ? dataFinal.value.options
      : dataFinal.value.options.length
  return len
})
const keyConfig = ref({ label: 'label', value: 'value',  })
const dataFinal = computed(() => {
  let data = { ...props.data }
  keyConfig.value = data.keyConfig || { label: 'label', value: 'value',  }
  if (
    !keyConfig.value ||
    !keyConfig.value.hasOwnProperty('label') ||
    !keyConfig.value.hasOwnProperty('value')
  ) {
    keyConfig.value = {
      label: 'label',
      value: 'value',
    }
    data.keyConfig = keyConfig.value
  }
  if (typeof data.options === 'number') {
    let option: { [key: string]: any }[] = []
    for (let i = 0; i < data.options; i++) {
      option.push({
        [keyConfig.value.value]: i,
        [keyConfig.value.label]: i + '',
      })
    }
    data.options = option
  }
  //设置默认值
  setDefaultValue(data)
  data.change = data.change || function () {}
  return data
})
const setDefaultValue = (data: checkboxInnerType) => {
  if (data.isDefault && (data.options as any[]).length > 0) {
    const isDefault = (data.options as any[]).find((item) => !item.disabled)
    bindValue.value = [(isDefault && isDefault[keyConfig.value.value]) || '']
  }
}
const emits = defineEmits(['update:modelValue'])

const bindValue = computed({
  get() {
    if (!checkExistence(props.modelValue)) setDefaultValue(dataFinal.value)

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
