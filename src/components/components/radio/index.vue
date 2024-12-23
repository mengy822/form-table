<template>
<el-config-provider :locale="language">
  <el-radio-group
    v-model="bindValue"
    :class="`_class${dataFinal.prop}`"
    :size="dataFinal.size??''"
    :disabled="dataFinal.disabled??false"
    :min="dataFinal.min??0"
    :max="dataFinal.max??dataFinal.options.length"
    :text-color="dataFinal.textColor??'#ffffff'"
    :fill="dataFinal.fill??'#409eff'"
    :tag="dataFinal.tag??'div'"
    ref="_ref"
    :validate-event="dataFinal.validateEvent??true"
    @change="change"
  >
    <template #default>
      <slot :name="`radio_${dataFinal.prop}`">
        <div v-if="props.type==='radio'">
          <el-radio
            v-for="(item,index) in (typeof dataFinal.options==='number'?[]:dataFinal.options)"
            :key="JSON.stringify(item)"
            :label="item.label"
            :value="item.value??item.label"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="dataFinal.config?.disabled??false"
            :name="dataFinal.config?.name??''"
            :checked="dataFinal.config?.checked??false"
            :border="dataFinal.config?.border"
            :size="dataFinal.config?.size??'default'"
            :indeterminate="dataFinal.config?.indeterminate??false"
            :validate-event="dataFinal.config?.validateEvent??true"
            :tabindex="index"
            @change="dataFinal.config?.change"
          >
            {{ item.label }}
          </el-radio>
        </div>

        <div v-if="props.type==='radioButton'">
          <el-radio-button
            v-for="item in (typeof dataFinal.options==='number'?[]:dataFinal.options)"
            :key="JSON.stringify(item)"
            :label="item.label"
            :value="item.value??item.label"
            :true-value="dataFinal.config?.trueValue"
            :false-value="dataFinal.config?.falseValue"
            :disabled="dataFinal.config?.disabled??false"
            :name="dataFinal.config?.name??''"
            :checked="dataFinal.config?.checked??false"
            >{{item.label}}</el-radio-button
          >
        </div>
      </slot>
    </template>
  </el-radio-group>
</el-config-provider>
</template>

<script setup name="radio" lang="ts">
import { computed, type PropType, ref } from 'vue';
import { type radioInnerType } from '../form/types'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  type: {
    type: String as PropType<'radio' | 'radioButton'>,
    default:'radio'
  },
  data: {
    type: Object as PropType<radioInnerType>,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: () => []
  }
});
const dataFinal = computed(() => {
  let data: radioInnerType = { ...props.data };
  if (typeof data.options === 'number') {
    let option: { label: string; value: string | number }[] = [];
    for (let i = 0; i < data.options; i++) {
      option.push({
        label: i + '',
        value: i
      });
    }
    data.options = option;
  }
  //设置默认值
  if (data.isDefault && data.options.length > 0) {
    let isDefault = data.options.find((item) => !item.disabled);
    bindValue.value=(isDefault && isDefault.value) || '';
  }
  data.change = data.change || function () {};
  return data;
});

const emits = defineEmits(['update:modelValue']);
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
  dataFinal.value&&dataFinal.value.change && dataFinal.value.change(e);
  emits('update:modelValue', e);
};
const _ref=ref()
defineExpose({
  _ref
})
</script>
