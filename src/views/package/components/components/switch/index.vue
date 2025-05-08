<template>
  <el-config-provider :locale="language">
    <el-switch
      v-model='bindValue'
      :disabled="data.disabled"
      :loading="data.loading"
      :size="data.size"
      :width="data.width"
      :inline-prompt="data.inlinePrompt"
      :active-icon="props.data.activeIcon"
      :inactive-icon="props.data.inactiveIcon"
      :active-action-icon="props.data.activeActionIcon"
      :inactive-action-icon="props.data.inactiveActionIcon"
      :active-text="props.data.activeText"
      :inactive-text="props.data.inactiveText"
      :active-value="props.data.activeValue"
      :inactive-value="props.data.inactiveValue"
      :name="props.data.name"
      :validate-event="props.data.validateEvent"
      :before-change="props.data.beforeChange"
      :class="`_class${dataFinal.prop} ${props.data.prop}`"
      :tabindex="props.data.tabindex"
      @change="change"
      ref="_ref"
    >
      <template v-for="(_,name) in slots" #[getName(name)]="scopeData">
        <slot :name="name" v-bind="scopeData"></slot>
      </template>
    </el-switch>
  </el-config-provider>
</template>
<script lang="ts">
export default {
    name: 'Switch'
}
</script>
<script setup lang='ts' name='switch'>
import { type PropType, computed, ref, useSlots } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { switchInnerType } from '../form/types'
const slot = useSlots()
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  data: {
    type: Object as PropType<switchInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Object, Array<String | Number | Boolean | Object>],
    default: () => [],
  },
})
import {getName} from '../../js/utils'
const dataFinal = computed(() => {
  let data = { ...props.data }
  data.change = data.change || function () {}
  return data
})
const emits = defineEmits(['update:modelValue'])
const bindValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    // if (props.modelValue != val) {
      change(val);
    // }
  }
});
const change = (e: typeof props.modelValue) => {
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  emits('update:modelValue', e)
}
const _ref = ref()
defineExpose({
  _ref,
})
</script>
