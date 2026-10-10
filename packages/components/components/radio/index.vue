<template>
  <el-radio-group
    v-model="bindValue"
    :class="`_class${dataFinal.prop}`"
    :size="dataFinal.size ?? ''"
    :disabled="dataFinal.disabled ?? false"
    :min="dataFinal.min ?? 0"
    :max="dataFinal.max ?? dataFinal.options.length"
    :text-color="dataFinal.textColor ?? '#ffffff'"
    :fill="dataFinal.fill ?? '#409eff'"
    :tag="dataFinal.tag ?? 'div'"
    ref="_ref"
    :validate-event="dataFinal.validateEvent ?? true"
    @change="change"
    v-bind="$attrs"
  >
    <template #default>
      <slot :name="`radio_${dataFinal.prop}`">
        <div v-if="props.type === 'radio'">
          <el-radio
            v-for="(item, index) in typeof dataFinal.options === 'number' ? [] : dataFinal.options"
            :key="JSON.stringify(item)"
            :label="item[keyConfig.label]"
            :value="item[keyConfig.value] ?? item[keyConfig.label]"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="dataFinal.config?.disabled ?? false"
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
          </el-radio>
        </div>

        <div v-if="props.type === 'radioButton'">
          <el-radio-button
            v-for="item in typeof dataFinal.options === 'number' ? [] : dataFinal.options"
            :key="JSON.stringify(item)"
            :label="item[keyConfig.label]"
            :value="item[keyConfig.value] ?? item[keyConfig.label]"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="dataFinal.config?.disabled ?? false"
            :name="dataFinal.config?.name ?? ''"
            :checked="dataFinal.config?.checked ?? false"
            >{{ item[keyConfig.label] }}</el-radio-button
          >
        </div>
      </slot>
    </template>
  </el-radio-group>
</template>
<script lang="ts">
export default {
  name: 'Radio',
}
</script>
<script setup name="radio" lang="ts">
import { computed, type PropType, ref, nextTick, watch } from 'vue'
import { type radioInnerType } from '../form/types'
import { checkExistence } from '../../js/utils';
import { findDefaultOptions } from '@/components/utils';
const props = defineProps({
  type: {
    type: String as PropType<'radio' | 'radioButton'>,
    default: 'radio',
  },
  data: {
    type: Object as PropType<radioInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: () => '',
  },
})
const keyConfig = ref({ label: 'label', value: 'value' })
const dataFinal = computed(() => {
  let data: radioInnerType = { ...props.data }
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
    let option: {  [key: string]: any  }[] = []
    for (let i = 0; i < data.options; i++) {
      option.push({
        [keyConfig.value.value]: i,
        [keyConfig.value.label]: i + '',
      })
    }
    data.options = option
  }
  if(!data.options)data.options=[]
  data.options=data.options.map((item) => {
    item.value = String(item.value);
    return item;
  });
  //设置默认值
  setDefaultValue(data)
  data.change = data.change || function () {}
  return data
})
const setDefaultValue = (data: radioInnerType) => {
  const { isDefault } = data;

  // 1. 未设置 / false / 空数组 跳过（保留 0 和 ''）
  if (isDefault === undefined || isDefault === false) return;
  if (Array.isArray(isDefault) && isDefault.length === 0) return;

  // 2. 无选项跳过
  if ((data.options as any[]).length === 0) return;
  const options = data.options as any[];
  // 3. 查找默认项（公共逻辑，含方案 B 兜底）
  const matched = findDefaultOptions({ options, isDefault }, false);
  if (matched.length === 0) return;

  // 4. ✅ radio 单选：取第一个
  bindValue.value = String(matched[0].value ?? '');

  // 5. 设置后禁用清除
  data.clearable = false;
}
const emits = defineEmits(['update:modelValue'])
const bindValue = computed({
  get() {
    if (!checkExistence(props.modelValue))
      setDefaultValue(dataFinal.value)
    return String(props.modelValue)
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
