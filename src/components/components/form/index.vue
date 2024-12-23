

<template>
  <el-form
    ref="formRef"
    v-model="dataFinal"
    :rules="rules"
    :inline="inline"
    :label-position="labelPosition"
    :label-width="labelWidth"
    :label-suffix="labelSuffix"
    :hide-required-asterisk="hideRequiredAsterisk"
    :require-asterisk-position="requireAsteriskPosition"
    :show-message="showMessage"
    :inline-message="inlineMessage"
    :status-icon="statusIcon"
    :validate-on-rule-change="validateOnRuleChange"
    :size="size"
    :disabled="disabled"
    :scroll-to-error="scrollToError"
  >
    <div v-for="item in columnFinal" :key="JSON.stringify(item)" :class="`class_${item.prop}`">
      <slot :name="item.prop" :prop="item.prop" :data="dataFinal">
        <el-form-item :ref="(el)=>dynamicCreateRef(el,item.prop)" :label="item.label" :prop="item.prop">
          <template #label>
            <slot :name="`label_${item.prop}`"></slot>
          </template>
          <template #error>
            <slot :name="`error_${item.prop}`"></slot>
          </template>

          <template #default>
            <slot :name="item.prop" :data="dataFinal">
              <Input :data="item" v-if="item.type==='input'" v-model:value="searchValue[item.prop]"></Input>
              <Date :data="item" v-if="item.type==='date'" v-model:value="searchValue[item.prop]"></Date>
              <Select :data="item" v-if="item.type==='select'" v-model:value="searchValue[item.prop]"></Select>
              <Switch :data="item" v-if="item.type==='switch'" v-model:value="searchValue[item.prop]"></Switch>
              <CheckBox :data="item" v-if="item.type==='checkbox'" v-model:value="searchValue[item.prop]"></CheckBox>
              <Radio :data="item" v-if="item.type==='radio'" v-model:value="searchValue[item.prop]"></Radio>
            </slot>
          </template>
        </el-form-item>
      </slot>
    </div>
  </el-form>
</template>

<script setup lang='ts' name='SonForm'>
import { FormRules } from 'element-plus';
import { PropType, ref, computed } from 'vue';
import { inputInnerType, selectInnerType, dateInnerType, checkboxInnerType, radioInnerType, switchInnerType } from './types';

const props = defineProps({
  
  //列
  column: {
    type: Array<inputInnerType | switchInnerType | checkboxInnerType | radioInnerType | selectInnerType | dateInnerType>,
    required: true
  },
  //行内表单模式
  inline: {
    type: Boolean,
    default: false
  },
  //表单域标签位置
  labelPosition: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: 'right'
  },
  //标签长度
  labelWidth: {
    type: [String, Number],
    default: ''
  },
  // 表单域标签后缀
  labelSuffix: {
    type: String,
    default: ''
  },
  //隐藏必填星号
  hideRequiredAsterisk: {
    type: Boolean,
    default: false
  },
  //星号位置
  requireAsteriskPosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },
  //是否显示错误信息
  showMessage: {
    type: Boolean,
    default: true
  },
  //以行内形式显示错误信息
  inlineMessage: {
    type: Boolean,
    default: false
  },
  //在输入框内显示反馈图标
  statusIcon: {
    type: Boolean,
    default: false
  },
  //是否在rules改变后立即触发
  validateOnRuleChange: {
    type: Boolean,
    default: true
  },
  //表单内组件尺寸
  size: {
    type: String as PropType<'' | 'large' | 'default' | 'small'>,
    default: ''
  },
  //禁用所有组件
  disabled: {
    type: Boolean,
    default: false
  },
  //滚动到第一个错误表单
  scrollToError: {
    type: Boolean,
    default: false
  }
});
const dataFinal = ref({});
const rules = ref<FormRules>({});
const columnFinal = computed(() => {
  return props.column.map((item: any) => {
    if (typeof item.isRequired === 'boolean' && item.isRequired) {
      rules.value[item.prop] = [
        {
          required: true,
          message: item.label + '不能为空',
          trigger: 'blur'
        },
        {
          required: true,
          message: item.label + '不能为空',
          trigger: 'change'
        }
      ];
    } else if (item.isRequired) {
      rules.value[item.prop] = [
        {
          validator: item.isRequired,
          trigger: 'blur'
        },
        {
          validator: item.isRequired,
          trigger: 'change'
        }
      ];
    }
    item.showMessage = item.showMessage ?? true;
    item.inlineMessage = item.inlineMessage ?? '';
    item.labelPosition = item.labelPosition ?? '';
    item.labelWidth = item.labelWidth ?? '';
    return item;
  });
});
const dynamicRefMap = ref<{ [name: string]: any }>({});
//动态创建表单ref
const dynamicCreateRef = (el: any, prop: string) => {
  dynamicRefMap.value[prop + 'Ref'] = el;
};
</script>

<style lang='scss' scope>
</style>
