<!--
 * @Author: bst 1@1.com
 * @Date: 2025-09-25 09:39:07
 * @LastEditors: bst 1@1.com
 * @LastEditTime: 2026-01-07 15:51:56
 * @FilePath: G:/bst/xm/nsp_website_v3/src/components/FormTable/Edit/index.vue
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 -->
<template>
  <MyEdit
    v-bind="{ ...props, ...attrs }"
    ref="myEditRef"
    :title="{ add: '导入' }"
    :submit-button-txt="{ add: '确定' }"
    @submit="submitFun"
    @close="handleClose"
  >
    <template #errorData>
      <!--      v-if="errorData && errorData.length > 0"-->
      <div class="errData" v-if="errorData && errorData.length > 0">
        <div class="title">错误信息</div>
        <el-table :data="errorData" style="width: 100%" height="250">
          <el-table-column
            v-for="item in errorColumn || []"
            :key="JSON.stringify(item)"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
          />
        </el-table>
      </div>
    </template>
  </MyEdit>
</template>
<script lang="ts" setup name="MyImport">
import { ref, useTemplateRef } from 'vue';
import MyEdit from '../Edit/index';
import { MyEditInstance } from '@/components/FormTable';
import { FormDialogProps } from '@/components/FormTable/Edit/index.vue';

const myEditRef = useTemplateRef<MyEditInstance>('myEditRef');

// 定义 Props 类型接口
type ImportDialogProps = FormDialogProps & {
  errorColumn: { label: string; prop: string; width: number | string }[];
};

// 使用 withDefaults 定义 Props 并配置默认值
const props = withDefaults(defineProps<ImportDialogProps>(), {
  errorColumn: []
});
const errorData = ref<ImportDialogProps['errorColumn']>([]);
const attrs = useAttrs();
//窗口关闭前事件
const handleClose = (cb: () => void) => {
  // emits('close');
  // cancelFun();
  errorData.value = [];
};

const init = async (
  data:
    | {
        [key: string]: any;
      }
    | Promise<any> = {},
  openCb: (dynamicComputedMap: any, initData: any) => void = () => {}
) => {
  myEditRef.value?.init(data, true, openCb);
};
// submit 事件的回调函数类型
type SubmitCallback = (flag: boolean | Promise<any>) => void;

// 所有 Emit 事件的完整类型接口
interface MyEditEmits {
  (eventName: 'submit', data: any, callback: SubmitCallback): void;

  (eventName: 'close'): void;
}

const emits = defineEmits<MyEditEmits>();
const cancelFun = () => {
  myEditRef.value?.close();
};
const updateData = (prop: string, data: any) => {
  myEditRef.value?.updateData(prop, data);
};

const getData = (prop: string) => {
  return myEditRef.value?.getData(prop);
};
const submitFun = async (e = {}, cb:(flag: boolean | Promise<any>,cb:(flag:boolean,data:any)=>void) => void) => {
  emits('submit', { ...e }, async (flag: boolean | Promise<any> = true, field: string = 'list') => {
    cb(flag, (flag:boolean, e:{[key:string]:any}) => {
      if (!flag) {
        const errdata:object|object[] = e[field];
        errorData.value = Array.isArray(errdata) ? errdata : [errdata] || [];
      }
    });
  });
};
defineExpose({
  init,
  close: cancelFun,
  updateData,
  getData,
  submit: submitFun
});
</script>

<style scoped lang="scss">
//:deep(.editDialog) {
//  display: block;
//}

.errData {
  .title {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-danger);
    margin-bottom: 20px;
  }
}
</style>
