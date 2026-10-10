<template>
  <el-select-v2
    :class="`_class${dataFinal.prop}`"
    v-model="bindValue"
    ref="_ref"
    :style="{ width: dataFinal.width }"
    :multiple="dataFinal.multiple"
    :clearable="dataFinal.clearable"
    :placeholder="'请选择' + dataFinal.label"
    :disabled="dataFinal.disabled"
    :value-key="dataFinal.valueKey"
    :size="dataFinal.size"
    :collapse-tags="dataFinal.collapseTags"
    :collapse-tags-tooltip="dataFinal.collapseTagsTooltip"
    :multiple-limit="dataFinal.multipleLimit"
    :name="dataFinal.name"
    :effect="dataFinal.effect"
    :autocomplete="dataFinal.autocomplete"
    :filterable="dataFinal.filterable"
    :allow-create="dataFinal.allowCreate"
    :filter-method="dataFinal.filterMethod"
    :remote="dataFinal.remote"
    :remote-method="remoteMethod"
    :remote-show-suffix="dataFinal.remoteShowSuffix"
    :loading="dataFinal.loading"
    :loading-text="dataFinal.loadingText"
    :no-match-text="dataFinal.noMatchText"
    :no-data-text="dataFinal.noDataText"
    :popper-class="dataFinal.popperClass"
    :reserve-keyword="dataFinal.reserveKeyword"
    :default-first-option="dataFinal.defaultFirstOption"
    :teleported="dataFinal.teleported"
    :append-to="dataFinal.appendTo"
    :persistent="dataFinal.persistent"
    :automatic-dropdown="dataFinal.automaticDropdown"
    :clear-icon="dataFinal.clearIcon"
    :fit-input-width="dataFinal.fitInputWidth"
    :suffix-icon="dataFinal.suffixIcon"
    :tag-type="dataFinal.tagType"
    :tag-effect="dataFinal.tagEffect"
    :validate-event="dataFinal.validateEvent"
    :placement="dataFinal.placement"
    :fallback-placements="dataFinal.fallbackPlacements"
    :max-collapse-tags="dataFinal.maxCollapseTags"
    :popper-options="dataFinal.popperOptions"
    :empty-values="dataFinal.emptyValues"
    :value-on-clear="dataFinal.valueOnClear"
    :props="dataFinal.keyConfig"
    @change="change"
    @visible-change="visibleChange"
    @remove-tag="dataFinal.removeTag"
    @clear="dataFinal.clear"
    @blur="blur"
    @focus="dataFinal.focus"
    :options="selectOptions"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
      <slot :name="name" v-bind="scopeData"></slot>
    </template>
  </el-select-v2>
</template>
<script lang="ts">
export default {
  name: 'Select',
}
</script>
<script setup lang="ts" name="select">
import { type PropType, ref, computed, watch, useSlots, nextTick } from 'vue'
import type { selectInnerType } from '../form/types'
import type { selectOptionsGroupType, selectOptionsType } from './types'
import { checkExistence, getName } from '../../js/utils'
import { findDefaultOptions } from '@/components/utils'

const remoteOptions = ref<any[]>([])
let finalRemoteOptions: any[] = []
let lastInputValue = ''
let setInputEvent = true
const selectOptions = computed(() => {
  const opts = checkExistence(remoteOptions.value)
    ? remoteOptions.value
    : (dataFinal.value.options as Array<any>)
  const errorData = opts.filter(
    (item: { value: null }) => item.value == null || typeof item.value == 'undefined'
  )
  if (errorData.length > 0) console.warn('部分数据错误,取消渲染', errorData)
  return opts
    .filter((item: { value: null }) => item.value != null && typeof item.value != 'undefined')
    .map((item) => {
      item.value = String(item.value)
      return item
    })
})
const visibleChange = (visible: boolean) => {
  dataFinal.value?.visibleChange?.(visible)
  if (!visible) {
    remoteOptions.value = finalRemoteOptions as any[]
  }
  if (visible && dataFinal.value.filterable && dataFinal.value.multiple != true) {
    nextTick(() => {
      // 找到 input 元素并让内容可编辑
      const input = _ref.value?.$el?.querySelector('.el-select__input')
      if (input) {
        // 获取当前选中项的 label
        const selected = selectOptions.value.find(
          (item: { value: any }) => item.value === bindValue.value
        )
        if (setInputEvent) {
          input.addEventListener('input', (e: any) => {
            lastInputValue = e.target.value
          })
          setInputEvent = false
        }
        if (selected && !input.value) {
          input.value = selected.label
          // 模拟输入事件让 filterable 生效
          input.dispatchEvent(new Event('input'))
        }
        input.focus()
        // 将光标移到末尾
        input.setSelectionRange(input.value.length, input.value.length)
      }
    })
  }
  if (!visible) {
    nextTick(() => {
      // 找到 input 元素并让内容可编辑
      const input = _ref.value?.$el?.querySelector('.el-select__input')
      if (input) {
        input.blur()
      }
    })
  }
}
const remoteMethod = (e: string) => {
  if (lastInputValue) e = e || lastInputValue
  dataFinal.value?.remoteMethod?.(
    e,
    (data) => {
      remoteOptions.value = data
    },
    dataFinal.value.extraParams || {}
  )
}

const slots = useSlots()
const props = defineProps({
  type: {
    type: String as PropType<'' | 'group'>,
    default: '',
  },
  data: {
    type: Object as PropType<selectInnerType>,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Object, Array<String | Number | Boolean | Object>],
    default: () => [],
  },
})

/**
 * 主函数：设置默认值
 */
const setDefaultValue = (data: selectInnerType) => {
  const { isDefault } = data

  // 1. 未设置 / false 跳过（保留 0 和 ''）
  if (isDefault === undefined || isDefault === false) return

  // 2. 空数组跳过
  if (Array.isArray(isDefault) && isDefault.length === 0) return

  // 3. 无选项跳过
  const options = data.options as selectOptionsGroupType[] | selectOptionsType[]
  if (options.length === 0) return

  // 4. 查找默认项
  const matched = findDefaultOptions(data, props.type !== '')
  if (matched.length === 0) return
  // 5. 赋值：根据 bindValue 是否数组决定单选/多选
  if (data.multiple) {
    bindValue.value = matched.map((item) => item.value)
  } else {
    bindValue.value = matched[0].value ?? ''
  }

  // 6. 设置默认值后禁用清除
  data.clearable = false
}
const emits = defineEmits(['update:modelValue'])

const change = (e: typeof props.modelValue) => {
  nextTick(() => {
    dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  })
}
const updateModelValue = (e: typeof props.modelValue) => {
  const selected = selectOptions.value.find((item) => item.value === e)
  if (selected && dataFinal.value && dataFinal.value.remote) {
    lastInputValue = selected.label
    remoteOptions.value = [selected]
  }
  emits('update:modelValue', e)
}
const blur = (e: any) => {
  dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e)
}
const keyConfig = ref({ label: 'label', value: 'value', disabled: 'disabled', options: 'options' })
const dataFinal = computed(() => {
  let data: selectInnerType = { ...props.data }
  keyConfig.value = data.keyConfig || {
    label: 'label',
    value: 'value',
    disabled: 'disabled',
    options: 'options',
  }
  if (
    !keyConfig ||
    !keyConfig.hasOwnProperty('label') ||
    !keyConfig.hasOwnProperty('value') ||
    !keyConfig.hasOwnProperty('disabled') ||
    !keyConfig.hasOwnProperty('options')
  ) {
    keyConfig.value = {
      label: 'label',
      value: 'value',
      disabled: 'disabled',
      options: 'options',
    }
    data.keyConfig = keyConfig.value
  }
  if (typeof data.options === 'number' || typeof data.options === 'string') {
    let option: { [key: string]: string | number }[] = []
    if (isNaN(Number(data.options)) || Number(data.options) < 0) {
      throw new Error(
        `${data.label}:options数据格式错误,应该为{ ${keyConfig.value.label},${keyConfig.value.value}}[]或数字,实际为${data.options}`
      )
    }
    for (let i = 0; i < Number(data.options); i++) {
      option.push({
        [keyConfig.value.label]: String(i),
        [keyConfig.value.value]: String(i),
      })
    }
    data.options = option
  }
  //设置默认值
  setDefaultValue(data)
  // if (data && data.remote) {
  //   const selected = data.options.find((item) => item.value === props.modelValue);
  //   if (selected) {
  //     lastInputValue = String(selected.label);
  //     remoteOptions.value = [selected];
  //   }
  // }
  data.change = data.change || function () {}
  data.visibleChange = data.visibleChange || function () {}
  data.removeTag = data.removeTag || function () {}
  data.clear = data.clear || function () {}
  data.blur = data.blur || function () {}
  data.focus = data.focus || function () {}
  return data
})
const bindValue = computed<typeof props.modelValue>({
  get() {
    // console.log(!props.modelValue || props.modelValue.length === 0, props.modelValue);
    if (!checkExistence(props.modelValue)) setDefaultValue(dataFinal.value)
    if (typeof props.modelValue === 'object') {
      return props.modelValue.map(String)
    }
    return String(props.modelValue)
  },
  set(val) {
    // if (props.modelValue != val) {
    finalRemoteOptions = remoteOptions.value
    updateModelValue(val)
    change(val)
    // }
  },
})
watch(
  () => bindValue.value,
  () => {
    change(bindValue.value)
    if (!checkExistence(bindValue.value)) {
      lastInputValue = ''
      return
    }
    const selected = selectOptions.value.find((item) => item.value === bindValue.value)
    if (selected && dataFinal.value && dataFinal.value.remote) {
      lastInputValue = selected.label
      remoteOptions.value = [selected]
    }
  }
)
const getInnerOptions = () => selectOptions.value

const _ref = ref()
defineExpose({
  _ref,
  getInnerOptions,
})
</script>
<style scoped lang="scss">
:deep(.el-select__selection) {
  min-width: 100px;
}
</style>
