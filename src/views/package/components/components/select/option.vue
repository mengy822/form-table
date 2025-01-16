<template>
  <el-option
    :tabindex="index"
    v-for="(optionItem,index) in props.options"
    :key="optionItem.value??optionItem.label"
    :label="optionItem.label"
    :value="String(optionItem.value??optionItem.label)"
    :disabled="optionItem.disabled"
  >
  <template #default="scope" v-if="$slots['option-default']">
    <slot :name="'option-default'" :data="scope"></slot>

  </template>
    <template #loading>
      <svg class="circular" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" />
      </svg>
    </template>
  </el-option>
</template>

<script name='option' setup lang='ts'>
import { type selectOptionsType } from './types';
const props = defineProps({
  options: {
    type: Array<selectOptionsType>,
    required: true
  }
});
</script>

<style lang='scss' scope>
.circular {
  display: inline;
  height: 30px;
  width: 30px;
  animation: loading-rotate 2s linear infinite;
  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: var(--el-color-primary);
    stroke-linecap: round;
  }
}
</style>
