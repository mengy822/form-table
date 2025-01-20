<template>
  <el-config-provider :locale="language">
    <el-select-v2
      :class="`_class${dataFinal.prop}`"
      v-model='bindValue'
      ref="_ref"
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
      :remote-method="dataFinal.remoteMethod"
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
      @change="change"
      @visible-change="dataFinal.visibleChange"
      @remove-tag="dataFinal.removeTag"
      @clear="dataFinal.clear"
      @blur="blur"
      @focus="dataFinal.focus"
      :options="dataFinal.options"
    >
      <template #header v-if="slots[`header_${dataFinal.prop}`]">
        <slot :name="`header_${dataFinal.prop}`">
        </slot>
      </template>

      <template #footer v-if="slots[`footer_${dataFinal.prop}`]">
        <slot :name="`footer_${dataFinal.prop}`">
        </slot>
      </template>
      <template #empty v-if="slots[`empty_${dataFinal.prop}`]">
        <slot :name="`empty_${dataFinal.prop}`">
        </slot>
      </template>
      <template #tag v-if="slots[`tag_${dataFinal.prop}`]">
        <slot :name="`tag_${dataFinal.prop}`">
        </slot>
      </template>

      <template #default="{item}" v-if="slots[`default_${dataFinal.prop}`]">
        <slot :name="`default_${dataFinal.prop}`" :item='item' :data="dataFinal.options">

        </slot>
      </template>
    </el-select-v2>
  </el-config-provider>
</template>

<script setup lang="ts" name="select">
import { type PropType, ref, computed, watch, useSlots } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { selectInnerType } from '../form/types'
import type { selectOptionsGroupType, selectOptionsType } from './types'

const slots = useSlots()
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    }
  },
  type: {
    type: String as PropType<'' | 'group'>,
    default: ''
  },
  data: {
    type: Object as PropType<selectInnerType>,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean, Object, Array<String | Number | Boolean | Object>],
    default: () => []
  }
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
  }
})
const change = (e: typeof props.modelValue) => {
  dataFinal.value && dataFinal.value.change && dataFinal.value.change(e)
  emits('update:modelValue', e)
}
const blur = (e: any) => {
  // return (...args) => {
  if (bindValue.value) {
    document.querySelector(`._class${dataFinal.value.prop}`)?.classList.remove('error')
  } else {
    document.querySelector(`._class${dataFinal.value.prop}`)?.classList.add('error')
  }
  dataFinal.value && dataFinal.value.blur && dataFinal.value.blur(e)
  // }
}
const dataFinal = computed(() => {
    let data: selectInnerType = { ...props.data }
    if (typeof data.options === 'number') {
      let option: { label: string; value: string | number }[] = []
      for (let i = 0; i < data.options; i++) {
        option.push({
          label: String(i),
          value: String(i)
        })
      }
      data.options = option
    }
    //设置默认值
    if (data.isDefault && data.options.length > 0) {
      if (props.type === '') {
        const isDefault: selectOptionsType | undefined = (data.options as selectOptionsType[]).find((item: selectOptionsType) => !item.disabled)
        // bindValue.value = (isDefault && isDefault.value) ?? ''
        bindValue.value=((isDefault && isDefault.value)??'')
      } else {
        const isDefaultGroup: selectOptionsGroupType | undefined = (data.options as selectOptionsGroupType[]).find((item: selectOptionsGroupType) => !item.disabled)
        const isDefault: selectOptionsType | undefined = isDefaultGroup && (isDefaultGroup.options as selectOptionsType[]).find((item: selectOptionsType) => !item.disabled)
        // bindValue.value = (isDefault && isDefault.value) ?? ''
        bindValue.value=((isDefault && isDefault.value)??'')
      }
      data.clearable = false
    }
    data.change = data.change || function() {
    }
    data.visibleChange = data.visibleChange || function() {
    }
    data.removeTag = data.removeTag || function() {
    }
    data.clear = data.clear || function() {
    }
    data.blur = data.blur || function() {
    }
    data.focus = data.focus || function() {
    }
    return data
  }
)
const _ref = ref()
defineExpose({
  _ref
})
</script>
