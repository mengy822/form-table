<template>
  <el-config-provider :locale="language">
    <!-- <el-dialog
      v-model="dialogVisible"
      :title="title"
      :width="width"
      :before-close="handleClose"
      v-bind="attr"
    > -->
    <MyDialog ref="myDialog" :width="width" :title="title" @before-close="handleClose">
      <el-descriptions
        class="detail"
        :border="desBorder"
        :column="desColumn"
        :direction="desDirection"
        :size="desSize"
        :title="desTitle"
        :extra="desExtra"
      >
        <template v-for="item in columnFinal" :key="JSON.stringify(item)">
          <el-descriptions-item
            :label="item.label"
            :span="item.span"
            :rowspan="item.rowspan"
            :width="item.width ?? labelWidth"
            :align="item.align"
            :label-align="item.labelAlign"
            :class-name="item.className"
            :label-class-name="item.labelClassName"
            v-if="item.showFun && item.showFun(dataFinal,item.prop)"
          >
            <template #label>
              <slot
                :name="'label_' + item.prop"
                :prop="item.prop"
                :nowData="dataFinal[item.prop]"
                :row="dataFinal"
              >
                {{ item.label }}
                <!--                <div :class="`detail-label detail-label-${item.prop}`">-->
                <!--                </div>-->
              </slot>
            </template>
            <template #default>
              <slot
                :name="item.prop"
                :prop="item.prop"
                :nowData="dataFinal[item.prop]"
                :row="dataFinal"
              >
                {{ item.fun(dataFinal, item.prop) }}
                <!--                <div :class="`detail-value detail-value-${item.prop}`">-->
                <!--                </div>-->
              </slot>
            </template>
          </el-descriptions-item>
        </template>
      </el-descriptions>
      <template #footer>
        <slot name="footer" :data="dataFinal">
          <div class="dialog-footer">
            <el-button @click="myDialog&&myDialog.handleClose">关闭</el-button>
          </div>
        </slot>
      </template>
    <!-- </el-dialog> -->
     </MyDialog>
  </el-config-provider>
</template>
<script lang="ts" setup name="MyDetail">
import {
  ref,
  watch,
  computed,
  type PropType,
  useAttrs,
  inject,
  useTemplateRef,
  nextTick,
} from 'vue'

interface columnType {
  prop: string
  label: string //标签文本
  span?: number //	列的数量
  rowspan?: number //	单元格应该跨越的行数
  width?: string | number //列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容）
  minWidth?: string | number //列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容）
  align?: 'left' | 'center' | 'right' //	列的内容对齐方式（如无 border，对标签和内容均生效）
  labelAlign?: 'left' | 'center' | 'right' //列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数）
  className?: string //列的内容自定义类名
  labelClassName?: string //column label custom class name
  fun?: (row: any, prop: string) => string | number
  showFun?: (row: any, prop: string) => boolean
  isForm?: boolean
}
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { MyDialogInstance } from '../../index'
import { deepClone } from '../js/utils'
const myDialog = useTemplateRef<MyDialogInstance>('myDialog')
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  //弹框宽度
  width: {
    type: String,
    default: '50%',
  },
  labelWidth: {
    type: String,
    default: '72px',
  },

  //弹框标题
  title: {
    type: String,
    default: '详情',
  },
  //是否带有边框
  desBorder: {
    type: Boolean,
    default: false,
  },
  //列数
  desColumn: {
    type: Number,
    default: 2,
  },
  //排列的方向
  desDirection: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'horizontal',
  },
  //列表的尺寸
  desSize: { type: String as PropType<'' | 'large' | 'default' | 'small'>, default: '' },
  //标题文本，显示在左上方
  desTitle: {
    type: String,
    default: '',
  },
  //操作区文本，显示在右上方
  desExtra: {
    type: String,
    default: '',
  },
  column: {
    type: Array<columnType>,
    required: true,
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
const dataFinal = ref<(typeof columnFinal.value)[number]['prop']>({})
const columnFinal = computed(() => {
  return deepClone(props.column)
    .filter((item: { isForm: any }) => typeof item.isForm == 'undefined' || item.isForm)
    .map((item: { align: string; span: number; rowspan: number; fun: (row: any, prop: any) => any; showFun: (row: any) => boolean; width: any }) => {
      item.align = item.align ?? 'left'
      item.span = item.span ?? 1
      item.rowspan = item.rowspan ?? 1
      if (!item.fun) item.fun = (row: any, prop: any) => row[prop]
      if (!item.showFun) item.showFun = (row: any) => true
      if (!item.width) {
        // item.width = '500px'; // (100 / props.desColumn) * item.rowspan + '%';
        // item.minWidth = (100 / props.desColumn) * item.rowspan + '%';
      }
      // console.log(item.width);
      return item
    })
    .sort((a: { no: any }, b: { no: any }) => (a.no || 0) - (b.no || 0))
})
const emit = defineEmits(['close'])
//窗口关闭前事件
const handleClose = (cb: () => void) => {
  dataFinal.value = {}
  cb()
  emit('close')
}
const init = (data: (typeof columnFinal.value)[number]['prop'], openCb: () => void = () => {}) => {
  dataFinal.value = { ...data }
  myDialog.value?.init()
  nextTick(() => {
    openCb()
  })
}
defineExpose({ init, handleClose })
</script>

<style scoped lang="scss">
.detail {
  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      tbody {
        tr {
          //display: flex;
          //border: 1px solid red;

          .el-descriptions__cell {
            width: calc(100% / v-bind(desColumn));

            /**
            label宽度固定
              */
            .el-descriptions__label {
              //min-width: 100px;
              display: table-cell;
            }

            /**
            文字超过 换行显示
            */
            .el-descriptions__content {
              //max-width: 300px;
              word-break: break-all;
              word-wrap: break-word;
              display: table-cell;
            }
          }
        }
      }
    }
  }

  :deep(.el-descriptions__footer) {
    border-top: 1px solid var(--brder-color);
  }
}
</style>
