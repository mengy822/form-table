<template>
  <el-dialog v-model="dialogVisible" :title="title" :width="width" :before-close="handleClose" v-bind="attr" @close="handleClose">
    <template v-for="(_, name) in slots" #[getName(name)]="scopeData">
      <slot :name="name" v-bind="scopeData"></slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="MyDialog">
import { ComponentInternalInstance, computed, getCurrentInstance, ref, useAttrs, useSlots } from 'vue';
import { getName } from '../js/utils';

const dialogVisible = ref<boolean>(false);
const slots = useSlots();

interface DialogBaseProps {
  /** 弹窗/组件标题 */
  title?: string;
  /** 弹窗/组件宽度 */
  width: number | string;
}

const props = withDefaults(defineProps<DialogBaseProps>(), {
  width: '50%'
});
const attrs = useAttrs();
const attr = computed(() => {
  let attrLs = {};
  const injectAttr = {};
  // for (const element of Object.keys(attrs)) {
  //   // inject()
  // }
  attrLs = { ...injectAttr, ...attrs };
  return attrLs;
});
/**
 * beforeClose 事件的回调函数类型
 * @description 用于控制弹窗是否关闭：调用该函数则关闭弹窗
 */
type BeforeCloseCallback = () => void;
const emits = defineEmits<{
  /**
   * 弹窗关闭前事件
   * @param callback - 关闭弹窗的触发函数（调用该函数才会关闭弹窗）
   * @description 父组件通过该事件接收关闭回调，可在回调前执行校验、确认等逻辑
   */
  (e: 'beforeClose', callback: BeforeCloseCallback): void;

  /**
   * 弹窗关闭事件（可选，若需区分 @close 与 :before-close 可补充）
   * @description 对应 el-dialog 的 @close 事件，弹窗关闭后触发（无参数）
   */
  // (e: 'close'): void;
}>();
const handleClose = () => {
  // cb(() => {});

  const internal = getCurrentInstance() as ComponentInternalInstance;
  const onEmit = (internal?.vnode.props || {}) as Record<string, any>;
  if (onEmit['onBeforeClose']) {
    emits('beforeClose', () => {
      dialogVisible.value = false;
    });
    return;
  }
  dialogVisible.value = false;
};
const init = () => {
  dialogVisible.value = true;
};
defineExpose({ init, handleClose });
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
