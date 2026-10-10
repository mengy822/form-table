<template>
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
            v-for="(item, index) in (dataFinal.options as any[])"
            :key="JSON.stringify(item)"
            :label="item[keyConfig.label]"
            :value="item[keyConfig.value] ?? item[keyConfig.label]"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="item.disabled ?? dataFinal.config?.disabled"
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
            v-for="item in (dataFinal.options as any[])"
            :key="JSON.stringify(item)"
            :label="item[keyConfig.label]"
            :value="item[keyConfig.value] ?? item[keyConfig.label]"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="item.disabled ?? dataFinal.config?.disabled"
            :name="dataFinal.config?.name ?? ''"
            :checked="dataFinal.config?.checked ?? false"
            >{{ item[keyConfig.label] }}</el-checkbox-button
          >
        </div>
      </slot>
    </template>
  </el-checkbox-group>
</template>
<script lang="ts">
export default {
  name: 'checkbox',
}
</script>
<script setup name="checkbox" lang="ts">
import { type PropType, ref, computed, nextTick, watch } from 'vue'
import { type checkboxInnerType } from '../form/types'
import { checkExistence } from '../../js/utils'
const props = defineProps({
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
const keyConfig = ref({ label: 'label', value: 'value' })
const dataFinal = computed(() => {
  let data = { ...props.data }
  keyConfig.value = data.keyConfig || { label: 'label', value: 'value' }
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
  if (!data.options) data.options = []
  data.options = data.options.map((item) => {
    item.value = String(item.value)
    return item
  })
  //设置默认值
  setDefaultValue(data)
  data.change = data.change || function () {}
  return data
})
const setDefaultValue = (data: checkboxInnerType) => {
  const { isDefault } = data;

  // 1. 未设置 / false / 空数组 跳过（保留 0 和 ''）
  if (isDefault === undefined || isDefault === false) return;
  if (Array.isArray(isDefault) && isDefault.length === 0) return;

  // 2. 无选项跳过
  const options = data.options as selectOptionsType[];
  if (options.length === 0) return;

  // 3. 查找默认项（公共逻辑，内部已含方案 B 兜底）
  const matched = findDefaultOptions({ options, isDefault });
  if (matched.length === 0) return;

  // 4. ✅ checkbox 差异点：永远输出数组
  bindValue.value = matched.map((item) => item.value);

  // 5. 设置后禁用清除
  data.clearable = false;
}
const emits = defineEmits(['update:modelValue'])

const bindValue = computed({
  get() {
    if (!checkExistence(props.modelValue)) setDefaultValue(dataFinal.value)

    return props.modelValue.map(String);
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
    change(bindValue.value)
  }
)
const change = (e: typeof props.modelValue) => {
  nextTick(() => {
    dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  })
}
const updateModelValue = (e: typeof props.modelValue) => {
  emits('update:modelValue', e)
}
const _ref = ref()
defineExpose({
  _ref,
})
</script>
