<template>
  <el-config-provider :locale="language">
    <!--    <el-dialog v-model="dialogVisible" :title="title" :width="width" :before-close="handleClose">-->
    <MyDialog ref="myDialog" :width="width" :title="title" @before-close="handleClose">
      <div class="detailDialog">
        <slot name="left" :data="dataFinal"></slot>
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
              :width="item.width"
              :align="item.align"
              :label-align="item.labelAlign"
              :class-name="item.className"
              :label-class-name="item.labelClassName"
              v-if="item.showFun && item.showFun(dataFinal, item.prop)"
            >
              <template #label>
                <slot
                  :name="'label_' + item.prop"
                  :prop="item.prop"
                  :nowData="dataFinal[item.prop]"
                  :row="dataFinal"
                >
                  {{ item.label }}：
                </slot>
              </template>
              <template #default>
                <slot
                  :name="item.prop"
                  :prop="item.prop"
                  :nowData="dataFinal[item.prop]"
                  :row="dataFinal"
                >
                  <span
                    v-if="!item.funDom||!item.useRander"
                    :class="`span span_${item.prop} span_${item.prop}_${dataFinal[item.prop]} span_other_${item.classFun && item.classFun(dataFinal, item.prop, attr)} ${item.classFun && item.classFun(dataFinal, item.prop, attr)} ${(item.fun && item.fun(dataFinal, item.prop, attr)) ?? defaultBlock}`"
                  >
                    {{ (item.fun && item.fun(dataFinal, item.prop, attr)) ?? defaultBlock }}
                  </span>
                  <component v-else :is="createMarkRaw(item.funDom, dataFinal, item.prop)"></component>
                </slot>
              </template>
            </el-descriptions-item>
          </template>
        </el-descriptions>
        <slot name="right" :data="dataFinal"></slot>
      </div>
      <template #footer>
        <slot name="footer" :data="dataFinal">
          <div class="dialog-footer">
            <el-button @click="myDialog.handleClose()">关闭</el-button>
          </div>
        </slot>
      </template>
    </MyDialog>
    <!--    </el-dialog>-->
  </el-config-provider>
</template>
<script lang="ts" setup name="MyDetail">
import { computed, markRaw, nextTick, ref, useAttrs, useSlots, useTemplateRef } from 'vue'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { deepClone } from '../js/utils'
import { MyDialogInstance, MyDialog } from '../..'
import { dataItemType, tableColumnItem } from '../Table/index.vue'

const attr = useAttrs()
const slots = useSlots()
const display = computed(() => {
  return slots['left'] || slots['right'] ? 'grid' : 'block'
})
const gridTemplateColumns = computed(() => {
  return `${slots['left'] ? 'auto ' : ''}1fr${slots['right'] ? ' auto' : ''}`
})
const createMarkRaw = (myRender:tableColumnItem['funDom'], data:dataItemType, prop:string, other = {}) => {
  const innerother = { ...other, ...attr, loading: false, renderTxt: (context:string|number|boolean) => context ?? props.defaultBlock };
  return markRaw({
    render() {
      return myRender!(data, prop, innerother);
    }
  });
};

// 定义 Props 类型接口，清晰划分配置维度
interface DesDialogProps {
  /** 语言配置（多语言支持） */
  language: object
  /** 弹框宽度 */
  width: string
  /** 表单/描述项标签宽度 */
  labelWidth: string
  /** 弹框标题 */
  title: string
  /** 描述项是否带有边框 */
  desBorder: boolean
  /** 描述项列数（控制布局） */
  desColumn: number
  /** 描述项排列方向（垂直/水平） */
  desDirection: 'vertical' | 'horizontal'
  /** 描述项列表尺寸（匹配 UI 库尺寸规范） */
  desSize: '' | 'large' | 'default' | 'small'
  /** 描述区域左上方标题文本 */
  desTitle: string
  /** 描述区域右上方操作区文本 */
  desExtra: string
  /** 描述项配置列表（必填，核心配置） */
  column: (tableColumnItem&{useRander?:boolean})[]
  defaultBlock: string
  /** 数据源格式配置（数据、成功状态码、状态码字段） */
  dataConfig: { data: string; status: string | number | boolean; code: string }
}

// 使用 withDefaults 配置 Props 与默认值
const props = withDefaults(defineProps<DesDialogProps>(), {
  dataConfig: () => ({ data: 'data', status: 200, code: 'code' }),
  // 语言配置：引用类型用工厂函数返回，避免实例共享
  language: () => zhCn,
  // 弹框基础样式
  width: '50%',
  labelWidth: '72px',
  title: '详情',
  // 描述项布局与样式
  desBorder: false,
  desColumn: 2,
  desDirection: 'horizontal',
  desSize: '',
  // 描述区域文本配置
  desTitle: '',
  desExtra: '',
  defaultBlock: '-',
  // 核心配置 column 为必填项，不设置默认值（TS 自动校验必填性）
  column: undefined,
})
const myDialog = useTemplateRef<MyDialogInstance>('myDialog')
const dataFinal = ref<{ [key: string]: any }>({})
const columnFinal = computed<(tableColumnItem&{useRander?:boolean})[]>(() => {
  return deepClone(props.column)
    .filter((item: { isForm: any }) => typeof item.isForm == 'undefined' || item.isForm)
    .map(
      (item: {
        align: string
        span: number
        rowspan: number
        fun: (row: any, prop: string) => string
        unit: any
        showFun: (row: any) => boolean
        useRander: boolean
      }) => {
        item.align = item.align ?? 'left'
        item.span = item.span ?? 1
        item.rowspan = item.rowspan ?? 1
        item.unit = item.unit ?? ''
        item.useRander=item.useRander||false
        // item.fun = item.fun ?? ((row: any, prop: string) => String(row[prop] ?? props.defaultBlock) + (item.unit ?? ''));
        item.fun =
          item.fun ??
          ((
            row: any,
            prop: string,
            other?: {
              index?: number
              searchValue?: { [key: string]: any }
              [key: string]: any
            }
          ) =>
            String(row[prop] ?? props.defaultBlock) +
            (typeof item.unit == 'string'
              ? item.unit
              : (item.unit && item.unit(row, prop, other)) ?? ''))

        if (!item.showFun) item.showFun = (row: any) => true
        // console.log(item.width);
        return item
      }
    )
    .sort((a: { no: any }, b: { no: any }) => (a.no || 0) - (b.no || 0))
})
const emit = defineEmits<{
  /**
   * 弹窗关闭事件
   * @description 弹窗关闭时触发，无额外参数
   */
  (e: 'close'): void

  /**
   * （可选）若后续扩展其他事件，可在此补充
   * 示例：如需要传递关闭时的数据源，可定义为：
   * (e: 'close-with-data', data: DataFinalType): void;
   */
}>()
//窗口关闭前事件
const handleClose = (cb: () => void) => {
  dataFinal.value = {}
  emit('close')
  cb()
}
const init = async (
  data: { [key: string]: any } | Promise<any> = {},
  openCb: (data: any) => void = () => {}
) => {
  let finaldata = {}
  if (data instanceof Promise) {
    let res;
    try {
      res = await data;
    } catch (e) {
      openCb({});
      return;
    }
    if (res[props.dataConfig.code] === props.dataConfig.status) {
      finaldata = res[props.dataConfig.data]
    }
  } else {
    finaldata = { ...data }
  }
  dataFinal.value = { ...finaldata }
  myDialog.value.init()
  nextTick(() => {
    openCb(dataFinal.value)
  })
}
const updateData = (prop: string, data: any): void => {
  dataFinal.value[prop] = data;
};

const getData = (prop: string): void => {
  return dataFinal.value[prop];
};
defineExpose({ init, handleClose, updateData, getData });
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
            //display: table-row;
            /**
            label宽度固定
              */
            .el-descriptions__label {
              //min-width: 100px;
              min-width: v-bind(labelWidth);
              display: table-cell;
            }

            /**
            文字超过 换行显示
            */
            .el-descriptions__content {
              //max-width: 300px;
              display: table-cell;
              word-break: break-all;
              word-wrap: break-word;
            }
          }
        }
      }
    }
  }
}
.detailDialog {
  max-height: 50vh;
  overflow-y: auto;
  display: v-bind(display);
  grid-gap: 20px;
  grid-template-columns: v-bind(gridTemplateColumns);
}
</style>
