<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    v-bind="attr"
    @close="handleClose"
  >
    <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
      <slot :name="name" v-bind="scopeData"></slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="MyDialog">
import { computed, ref, useAttrs, useSlots } from 'vue'
import { getName } from '../js/utils'

const dialogVisible = ref<boolean>(false)
const slots = useSlots()
const props = defineProps({
  title: String,
  width: {
    type: [Number, String],
    default: '50%',
  },
})
const attrs = useAttrs()
const attr = computed(() => {
  let attrLs = {}
  const injectAttr = {}
  // for (const element of Object.keys(attrs)) {
  //   // inject()
  // }
  attrLs = { ...injectAttr, ...attrs }
  return attrLs
})
const emits = defineEmits(['beforeClose'])
const handleClose = () => {
  // cb(() => {});

  emits('beforeClose', () => {
    dialogVisible.value = false
  })
}
const init = () => {
  dialogVisible.value = true
}
defineExpose({ init, handleClose })
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  padding-top: 0;
  padding-bottom: 0;
  margin: 0 auto !important;

  .el-dialog__body {
    padding: 15px !important;
  }

  .el-dialog__header {
    padding: 16px 16px 8px 16px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--brder-color);
    margin-right: 0;
  }

  .el-dialog__footer {
    padding: 8px 16px 16px 16px;
    //box-sizing: border-box;
    border-top: 1px solid red;
    margin-right: 0;
  }
}
</style>
