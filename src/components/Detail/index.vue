<template>
  <el-config-provider :locale="language">
    <el-dialog v-model="dialogVisible"
               :title="title"
               :width="width"
               :before-close="handleClose">
      <el-descriptions
        :border="desBorder"
        :column="desColumn"
        :direction="desDirection"
        :size="desSize"

        :title="desTitle"
        :extra="desExtra">
        <el-descriptions-item
          v-for="item in columnFinal"
          :key="JSON.stringify(item)"
          :label="item.label"
          :span="item.span"
          :rowspan="item.rowspan"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align"
          :label-align="item.labelAlign"
          :class-name="item.className"
          :label-class-name="item.labelClassName"
        >
          <template #label>
            <slot :name="'label_'+item.prop" :prop="item.prop" :data="dataFinal">
              {{ item.label }}
            </slot>
          </template>
          <template #default>
            <slot :name="item.prop" :prop="item.prop" :data="dataFinal">
              {{ item.fun(dataFinal, item.prop) }}
            </slot>
          </template>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <slot name="footer" :data="dataFinal">
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false"> 关闭</el-button>
          </div>
        </slot>
      </template>
    </el-dialog>
  </el-config-provider>
</template>
<script lang="ts" setup name='MyDetail'>
import { ref, watch, computed,type PropType } from 'vue'

interface columnType {
  prop: string;
  label: string; //标签文本
  span?: number; //	列的数量
  rowspan?: number; //	单元格应该跨越的行数
  width?: string | number; //列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容）
  minWidth?: string | number; //列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容）
  align?: 'left' | 'center' | 'right'; //	列的内容对齐方式（如无 border，对标签和内容均生效）
  labelAlign?: 'left' | 'center' | 'right'; //列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数）
  className?: string; //列的内容自定义类名
  labelClassName?: string; //column label custom class name
  fun: (row: any, prop: string) => string | number;
}

import zhCn from 'element-plus/es/locale/lang/zh-cn'

const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    }
  },
  //弹框宽度
  width: {
    type: String,
    default: '50%'
  },
  //弹框标题
  title: {
    type: String,
    default: '详情'
  },
  //是否带有边框
  desBorder: {
    type: Boolean,
    default: true
  },
  //列数
  desColumn: {
    type: Number,
    default: 2
  },
  //排列的方向
  desDirection: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'horizontal'
  },
  //列表的尺寸
  desSize: { type: String as PropType<'' | 'large' | 'default' | 'small'>, default: '' },
  //标题文本，显示在左上方
  desTitle: {
    type: String,
    default: ''
  },
  //操作区文本，显示在右上方
  desExtra: {
    type: String,
    default: ''
  },
  column: {
    type: Array<columnType>,
    required: true
  }
})
const dataFinal = ref({})
const columnFinal = computed(() => {
  return props.column.map((item: columnType) => {
    item.align = item.align ?? 'left'
    item.span = item.span ?? 1
    item.rowspan = item.rowspan ?? 1
    if (!item.fun) item.fun = (row: any, prop: any) => row[prop]
    return item
  })
})
const dialogVisible = ref<boolean>(false)
//窗口关闭前事件
const handleClose = () => {
  dataFinal.value = {}
  dialogVisible.value = false
}
const init = (data: any) => {
  dataFinal.value = {...data}
  dialogVisible.value = true
}
defineExpose({ init, dialogVisible })
</script>

<style scoped lang='scss'>
</style>
