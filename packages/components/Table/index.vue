<template>
  <el-config-provider :locale="language">
    <el-card shadow="hover" class="table-plus-operation">
      <template #header>
        <slot name="header">
          <el-row :gutter="10">
            <el-col :span="1.5" v-if="hasAdd && proxyProps[`onAdd`]">
              <el-button
                :loading="operationLoading"
                type="primary"
                plain
                :icon="hasAddIcon"
                @click="handleAdd()"
                >{{ typeof hasAdd !== 'boolean' ? hasAdd : '新增' }}
              </el-button>
            </el-col>
            <el-col
              :span="1.5"
              v-if="hasSelection && hasBatchRemove && proxyProps[`onBatchRemove`]"
            >
              <el-button
                type="danger"
                plain
                :loading="operationLoading"
                :icon="hasBatchRemoveIcon"
                @click="handleBatchRemove()"
              >
                {{ typeof hasBatchRemove !== 'boolean' ? hasBatchRemove : '删除' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="hasExport && proxyProps[`onExport`]">
              <el-button
                :loading="operationLoading"
                type="warning"
                plain
                :icon="hasExportIcon"
                @click="handleExport()"
              >
                {{ typeof hasExport !== 'boolean' ? hasExport : '导出' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="hasImport && proxyProps[`onImport`]">
              <el-button
                :loading="operationLoading"
                type="info"
                plain
                :icon="hasImportIcon"
                @click="handleImport()"
              >
                {{ typeof hasImport !== 'boolean' ? hasImport : '导入' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="slots['tableOperation']">
              <slot name="tableOperation"> </slot>
            </el-col>
            <right-toolbar
              :search="proxyProps['onUpdate:showSearch']"
              v-model:showSearch="showSearch"
              v-model:columns="canHiddenColumns"
              @queryTable="handleQuery(undefined, true)"
            ></right-toolbar>
          </el-row>
        </slot>
      </template>
      <el-table
        class="table-plus-main"
        :height="height || heightInner || maxHeight"
        :max-height="maxHeight || maxHeightInner || height"
        v-loading="loading"
        :data="dataListComputed"
        @selection-change="handleSelectionChange"
        ref="tableRef"
        :highlight-current-row="highlightCurrentRow"
        :current-row-key="currentRowKey"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :cell-class-name="cellClassName"
        :cell-style="cellStyle"
        :header-row-class-name="headerRowClassName"
        :header-row-style="headerRowStyle"
        :header-cell-class-name="headerCellClassName"
        :header-cell-style="headerCellStyle"
        :row-key="rowKey"
        :empty-text="emptyText"
      >
        <el-table-column
          v-if="hasSelection"
          type="selection"
          :fixed="$slots['selectionFixed'] ?? 'left'"
          :selectable="typeof hasSelection === 'boolean' ? () => true : hasSelection"
          :width="$slots['selectionWidth'] ?? 55"
        />
        <el-table-column
          :fixed="$slots['indexFixed'] ?? 'left'"
          v-if="hasIndex"
          :min-width="$slots['indexMinWidth'] ?? 60"
          prop="index"
          :label="typeof hasIndex === 'boolean' ? '序号' : hasIndex"
        >
          <template #default="scope">
            {{ queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1 }}
          </template>
        </el-table-column>
        <MyTableColumn :tableColumnFinal="tableColumnFinal"></MyTableColumn>

        <el-table-column
          :fixed="$slots['operationFixed'] ?? 'left'"
          :width="$slots['operationWidth'] ?? 200"
          v-if="hasOperation"
        >
          <template #header>
            <slot name="operationHeader">
              {{ typeof hasOperation === 'boolean' ? '操作' : hasOperation }}
            </slot>
          </template>
          <template #default="scope">
            <slot
              :name="`operationBefore`"
              :data="scope.row"
              :index="scope.index"
              :text="hasOperationText"
              :link="hasOperationLink"
              :loading="operationLoading"
            ></slot>
            <slot name="detail" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasDetail === 'boolean'
                    ? undefined
                    : typeof hasDetail === 'function'
                    ? hasOperationName
                      ? hasDetail(scope.row)
                      : undefined
                    : hasDetail) ?? '详情'
                }`"
                placement="top"
                v-if="
                  typeof hasDetail === 'function'
                    ? hasDetail(scope.row)
                    : hasDetail && proxyProps[`onDetail`]
                "
              >
                <el-button
                  :text="hasOperationText"
                  :link="hasOperationLink"
                  :type="hasDetailType"
                  :loading="operationLoading"
                  :icon="hasDetailIcon"
                  @click="handleDetail(scope.row)"
                >
                  {{
                    typeof hasDetail === 'boolean'
                      ? undefined
                      : typeof hasDetail === 'function'
                      ? hasOperationName
                        ? hasDetail(scope.row)
                        : undefined
                      : hasDetail
                  }}
                </el-button>
              </el-tooltip>
            </slot>
            <slot :name="`operationAfterDetail`" :data="scope.row" :index="scope.index" :text="hasOperationText" :link="hasOperationLink" :loading="operationLoading"></slot>
            <slot name="update" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasUpdate === 'boolean'
                    ? undefined
                    : typeof hasUpdate === 'function'
                    ? hasOperationName
                      ? hasUpdate(scope.row)
                      : undefined
                    : hasUpdate) ?? '修改'
                }`"
                placement="top"
                v-if="
                  typeof hasUpdate === 'function'
                    ? hasUpdate(scope.row)
                    : hasUpdate && proxyProps[`onUpdate`]
                "
              >
                <el-button
                  :text="hasOperationText"
                  :link="hasOperationLink"
                  :type="hasUpdateType"
                  :loading="operationLoading"
                  :icon="hasUpdateIcon"
                  @click="handleUpdate(scope.row)"
                >
                  {{
                    typeof hasUpdate === 'boolean'
                      ? undefined
                      : typeof hasUpdate === 'function'
                      ? hasOperationName
                        ? hasUpdate(scope.row)
                        : undefined
                      : hasUpdate
                  }}
                </el-button>
              </el-tooltip>
            </slot>
            <slot :name="`operationAfterUpdate`" :data="scope.row" :index="scope.index" :text="hasOperationText" :link="hasOperationLink" :loading="operationLoading"></slot>
            <slot name="remove" :data="scope.row">
              <el-tooltip
                :content="`${
                  (typeof hasRemove === 'boolean'
                    ? undefined
                    : typeof hasRemove === 'function'
                    ? hasOperationName
                      ? hasRemove(scope.row)
                      : undefined
                    : hasRemove) ?? '删除'
                }`"
                placement="top"
                v-if="
                  typeof hasRemove === 'function'
                    ? hasRemove(scope.row)
                    : hasRemove && proxyProps[`onRemove`]
                "
              >
                <el-button
                  :text="hasOperationText"
                  :link="hasOperationLink"
                  :type="hasRemoveType"
                  :loading="operationLoading"
                  :icon="hasRemoveIcon"
                  @click="handleRemove(scope.row)"
                >
                  {{
                    typeof hasRemove === 'boolean'
                      ? undefined
                      : typeof hasRemove === 'function'
                      ? hasOperationName
                        ? hasRemove(scope.row)
                        : undefined
                      : hasRemove
                  }}
                </el-button>
              </el-tooltip>
            </slot>
            <slot :name="`operationAfter`" :data="scope.row" :index="scope.index" :text="hasOperationText" :link="hasOperationLink" :loading="operationLoading"> </slot>
          </template>
        </el-table-column>
        <template #empty v-if="slots['empty']">
          <slot name="empty"></slot>
        </template>
      </el-table>
      <pagination
        class="table-plus-pagination"
        v-show="totalComputed as number > 0"
        :total="totalComputed"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyTable">
import {
  computed,
  ref,
  watch,
  useSlots,
  onMounted,
  type PropType,
  type CSSProperties,
  provide,
  nextTick,
  inject,
  type VNode,
  type Component,
  getCurrentInstance,
} from 'vue'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import MyTableColumn from '../components/tableColumn'
import { Plus, Search, Delete, Edit, Upload, Download, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, TableInstance } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ButtonType, type tableColumnItem } from './props'
import { dataItemType, queryParamType } from '../js/types'
import { getDomComputed, getComputedStyle, deepClone } from '../js/utils'
const slots = useSlots()

interface query extends queryParamType {
  pageSize: number
  pageNum: number
}
const props = defineProps({
  language: {
    type: Object,
    default: () => {
      return zhCn
    },
  },
  hasIndex: {
    type: [Boolean, String],
    default: true,
  },

  hasSelection: {
    type: [Boolean, Function] as PropType<boolean | ((row: any, index: number) => boolean)>,
    default: false,
  },

  hasOperation: {
    type: [Boolean, String],
    default: true,
  },
  hasOperationName: {
    type: [Boolean],
    default: false,
  },

  maxHeight: {
    type: [Number, String],
    default: undefined,
  },
  height: {
    type: [Number, String],
    default: undefined,
  },
  baseClass: {
    type: [String],
    default: undefined,
  },
  maxWidth: {
    type: Boolean,
    default: true,
  },
  hasAdd: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasAddIcon: {
    type: Object,
    default: () => {
      return Plus
    },
  },
  hasBatchRemove: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasBatchRemoveIcon: {
    type: Object,
    default: () => {
      return Delete
    },
  },
  hasImport: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasImportIcon: {
    type: Object,
    default: () => {
      return Upload
    },
  },
  hasExport: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasExportIcon: {
    type: Object,
    default: () => {
      return Download
    },
  },
  hasOperationText: { type: Boolean, default: () => true },
  hasOperationLink: { type: Boolean, default: () => true },
  hasDetail: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasDetailIcon: {
    type: Object,
    default: () => {
      return View
    },
  },
  hasDetailType: { type: String as PropType<ButtonType>, default: () => 'primary' },
  hasUpdate: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasUpdateIcon: {
    type: Object,
    default: () => {
      return Edit
    },
  },
  hasUpdateType: { type: String as PropType<ButtonType>, default: () => 'warning' },
  hasRemove: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasRemoveIcon: {
    type: Object,
    default: () => {
      return Delete
    },
  },
  hasRemoveType: { type: String as PropType<ButtonType>, default: () => 'danger' },
  tableColumn: {
    type: Array<tableColumnItem>,
    required: true,
  },
  queryParam: {
    type: Object as () => queryParamType,
    required: true,
  },
  removeMessage: {
    type: String,
    default: '您确定删除该数据吗? 警告:该操作不可逆,请慎重操作',
  },
  removeType: {
    type: String as PropType<'warning' | 'info' | 'error' | 'success'>,
    default: 'warning',
  },
  removeMessageTitle: {
    type: String,
    default: '警告',
  },
  exportMessage: {
    type: [String, Boolean],
    default: '是否确认导出数据?',
  },
  exportType: {
    type: String as PropType<'warning' | 'info' | 'error' | 'success'>,
    default: 'warning',
  },
  exportMessageTitle: {
    type: String,
    default: '提示',
  },
  dataList: {
    type: Array<dataItemType>,
    default: () => {
      return undefined
    },
  },
  dataListFun: {
    type: Function,
  },
  dataConfig: {
    type: Object as PropType<{
      rows: string
      total: string
    }>,
    default: () => {
      return {
        rows: 'rows',
        total: 'total',
      }
    },
  },
  total: {
    type: Number,
    default: 0,
  },

  highlightCurrentRow: {
    //是否要高亮当前行
    type: Boolean,
    default: false,
  },
  currentRowKey: {
    //当前行的 key，只写属性
    type: [String, Number],
    default: '',
  },
  rowClassName: {
    //行的 className 的回调方法，也可以使用字符串为所有行设置一个固定的 className。
    type: [String, Function] as PropType<
      string | ((data: { row: any; rowIndex: number }) => string)
    >,
    default: '',
  },
  rowStyle: {
    //行的 style 的回调方法，也可以使用一个固定的 Object 为所有行设置一样的 Style。
    type: [Object, Function] as PropType<
      CSSProperties | ((data: { row: any; rowIndex: number }) => CSSProperties)
    >,
    default: () => {
      return {}
    },
  },
  cellClassName: {
    //单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。
    type: [String, Function] as PropType<
      string | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => string)
    >,
    default: '',
  },
  cellStyle: {
    //单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有单元格设置一样的 Style。
    type: [Object, Function] as PropType<
      | CSSProperties
      | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => CSSProperties)
    >,
    default: () => {
      return {}
    },
  },
  headerRowClassName: {
    //表头行的 className 的回调方法，也可以使用字符串为所有表头行设置一个固定的 className。
    type: [String, Function] as PropType<
      string | ((data: { row: any; rowIndex: number }) => string)
    >,
    default: '',
  },
  headerRowStyle: {
    //表头行的 style 的回调方法，也可以使用一个固定的 Object 为所有表头行设置一样的 Style。
    type: [Object, Function] as PropType<
      CSSProperties | ((data: { row: any; rowIndex: number }) => CSSProperties)
    >,
    default: () => {
      return {}
    },
  },
  headerCellClassName: {
    //表头单元格的 className 的回调方法，也可以使用字符串为所有表头单元格设置一个固定的 className。
    type: [String, Function] as PropType<
      string | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => string)
    >,
    default: '',
  },
  headerCellStyle: {
    //表头单元格的 style 的回调方法，也可以使用一个固定的 Object 为所有表头单元格设置一样的 Style。
    type: [Object, Function] as PropType<
      | CSSProperties
      | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => CSSProperties)
    >,
    default: () => {
      return {}
    },
  },
  rowKey: {
    //行数据的 Key，用来优化 Table 的渲染； 在使用reserve-selection功能与显示树形数据时，该属性是必填的。 类型为 String 时，支持多层访问：user.info.id，但不支持 user.info[0].id，此种情况请使用 Function。
    type: [String, Function] as PropType<string | ((row: any) => string)>,
    default: '',
  },
  emptyText: {
    //空数据时显示的文本内容， 也可以通过 #empty 设置
    type: [String],
    default: '没有数据',
  },
  duration: {
    type: Number,
    default: 1500,
    validator(value: number) {
      // The value must match one of these strings
      return value >= 0
    },
  },
  message: {
    type: String,
    default: '操作成功',
  },
})

//表格实例
const tableRef = ref<TableInstance>()
const heightInner = ref(0)
const maxHeightInner = ref(0)
const getHeight = (className: string): number => {
  let baseClassHeightDom = document.querySelector(className)
  let baseClassHeight = 0
  if (baseClassHeightDom) {
    let baseClassStyle = getComputedStyle(baseClassHeightDom)
    // console.log(getDomComputed(baseClassStyle, 'height') ,className)
    baseClassHeight = getDomComputed(baseClassStyle, 'height')
  }
  return baseClassHeight
}
const totalInner = ref<Number>(0)
const dataListInner = ref([])
const totalComputed = computed({
  get: () => {
    return props.total || totalInner.value
  },
  set: (val: number) => {
    totalInner.value = val
  },
})
const dataListComputed = computed({
  get: () => {
    return props.dataList || dataListInner.value
  },
  set: (val) => {
    dataListInner.value = val
  },
})
const proxyProps = ref({
  onAdd: false,
  onUpdate: false,
  onDetail: false,
  onRemove: false,
  onDataLoadCompleted: false,
  'onUpdate:showSearch': false,
  onBatchRemove:false
})
onMounted(() => {
  const internal = getCurrentInstance()
  const onEmit = (internal?.vnode.props || {}) as Record<string, any>
  for (const emit in onEmit) {
    proxyProps.value[emit] = typeof onEmit[emit] === 'function'
  }
  // 事件处理器会被归一化为 onXxx
  // hasUpdateListener.value = typeof props.onUpdate === 'function'
  // nextTick(()=>{
  //   if (
  //   props.baseClass &&
  //   typeof props.height == 'undefined' &&
  //   typeof props.maxHeight === 'undefined'
  // ) {
  //   let baseClassHeight = getHeight(props.baseClass)
  //   let formPlusMainHeight = getHeight('.form-plus-main')
  //   let tableHeaderHeight = getHeight('.el-card__header')+getHeight('.el-table__header-wrapper')
  //   let pageHeight = getHeight('.pagination-container')
  //   console.log(baseClassHeight, formPlusMainHeight, tableHeaderHeight, pageHeight)
  //   heightInner.value = baseClassHeight - formPlusMainHeight - tableHeaderHeight - pageHeight
  //   maxHeightInner.value = heightInner.value
  // }
  // })
})
//多选事件
const selectable = (row: tableColumnItem) => row.selectable
//多选数据
const multipleSelection = ref<tableColumnItem[]>([])
//多选
const toggleSelection = (rows?: tableColumnItem[], ignoreSelectable?: boolean) => {
  if (rows) {
    rows.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, undefined, ignoreSelectable)
    })
  } else {
    tableRef.value?.clearSelection()
  }
}
//多选
const handleSelectionChange = (val: tableColumnItem[]) => {
  multipleSelection.value = val
}
const getTextWidth = (text: string, font: string) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = font
  return context.measureText(text).width
}
//需要隐藏的表格列
const canHiddenColumns = computed({
  get() {
    let data = tableColumn.value
      .filter((item) => item.isTable || typeof item.isTable === 'undefined')
      .map((item, index) => {
        return {
          key: item.prop,
          label: item.label,
          visible: item.visible ?? true,
          hidden: item.hidden,
          index: index,
          maxWidth: item.width ? false : item.maxWidth ?? props.maxWidth,
        }
      })
      .filter((item) => item.hidden)
    return data
  },
  set(data) {
    data.forEach((item) => {
      tableColumn.value[item.index].visible = item.visible
    })
  },
})
const tableColumn = ref<typeof props.tableColumn>([])
const tableColumnFinal = computed({
  get() {
    if (tableColumn.value.length === 0) {
      tableColumn.value = deepClone(props.tableColumn)
        .filter((item) => item.isTable || typeof item.isTable === 'undefined')
        .map((item) => {
          item.visible = item.visible ?? true
          if (slots[item.prop]) {
            item.slot = item.prop
          }
          item.selectable = item.selectable ?? true
          item.maxWidth = item.width ? false : item.maxWidth ?? props.maxWidth
          item.fun =
            item.fun ??
            ((row: dataItemType, prop: string, index?: number) =>
              String(row[prop]) + (item.unit ?? ''))
          return item
        })
    }
    return tableColumn.value
  },
  set(data) {
    tableColumn.value = [...data]
  },
})

// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref<boolean>(true)
const showSearchInner = ref(true)
const showSearch = computed({
  get() {
    return showSearchInner.value
  },
  set(value) {
    showSearchInner.value = value
    if (proxyProps.value[`onUpdate:showSearch`]) emits('update:showSearch', showSearchInner.value)
  },
})

const queryParams = ref<query>({ pageSize: 10, pageNum: 1, ...props.queryParam })
watch(
  () => props.queryParam,
  () => {
    queryParams.value = { ...queryParams.value, ...props.queryParam }
  },
  {
    deep: true,
    immediate: true,
  }
)
const emits = defineEmits([
  'query',
  'add',
  'update',
  'detail',
  'remove',
  'update:showSearch',
  'batch-remove',
  'import',
  'export',
  'dataLoadCompleted',
])

watch(
  () => props.dataList,
  () => {
    loading.value = false
  },
  {
    deep: true,
    immediate: true,
  }
)
const startQuery = () => {
  loading.value = true
}
const handleQuery = (queryParam = { ...queryParams.value }, isFirst: boolean = false) => {
  loading.value = true
  if (typeof queryParam == 'undefined') {
    queryParam = { ...queryParams.value }
  }
  if (typeof isFirst === 'boolean' && isFirst) {
    queryParam.pageNum = 1
  }
  queryParams.value = { ...(queryParam || { ...queryParams.value }) }
  if (!props.dataListFun) {
    emits('query', queryParams.value)
  } else {
    props.dataListFun(queryParam, async (res, ...obj) => {
      try {
        if (res instanceof Promise) {
          res = await (res as Promise)
        } else {
          res = {
            [props.dataConfig.rows]: res,
            [props.dataConfig.total]: obj[0],
          }
        }
        const datas = res[props.dataConfig.rows]
        const total = res[props.dataConfig.total]
        if (proxyProps.value['onDataLoadCompleted']) emits('dataLoadCompleted', datas, total)
        dataListComputed.value = datas
        totalComputed.value = total
      } catch (e) {
      } finally {
        loading.value = false
      }
    })
  }
}
const handleAdd = () => {
  emits('add')
}
const handleImport = () => {
  emits('import')
}
const handleExport = () => {
  const data = {
    ...queryParams.value,
    multipleSelection: multipleSelection.value,
  }
  const cb = () => {
    operationLoading.value = false
  }
  operationLoading.value = true
  if (typeof props.exportMessage === 'boolean' && !props.exportMessage) {
    emits('export', data, cb)
  } else {
    ElMessageBox.confirm(props.exportMessage as string, props.exportType, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      title: props.exportMessageTitle,
      type: props.exportType,
    })
      .then(() => {
        emits('export', data, cb)
      })
      .catch(() => {
        operationLoading.value = false
      })
  }
}

const handleBatchRemove = () => {
  emits('batch-remove')
}
const handleUpdate = (row: dataItemType) => {
  emits('update', row)
}
const operationLoading = ref(false)
const handleRemove = (row: dataItemType) => {
  operationLoading.value = true
  ElMessageBox.confirm(props.removeMessage, props.removeType, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: props.removeMessageTitle,
    type: props.removeType,
  })
    .then(() => {
      emits('remove', row, (flag = true) => {
        if (flag) {
          ElMessage({
            message: props.message,
            grouping: true,
            duration: props.duration,
            type: 'success',
            showClose: props.duration! > 0,
            onClose: () => {
              operationLoading.value = false
              handleQuery()
            },
          })
        } else {
          operationLoading.value = false
        }
      })
    })
    .catch(() => {
      operationLoading.value = false
    })
}
const handleDetail = (row: dataItemType) => {
  emits('detail', row)
}
defineExpose({
  multipleSelection: multipleSelection.value,
  toggleSelection,
  startQuery,
  query: handleQuery,
  slots,
})
</script>
<style scoped lang="scss">
/* 创建通用隐藏类 hidden-columns*/
:deep(.table-column-hidden) {
  position: absolute !important;
  width: 1px !important;
  min-width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  border: 0 !important;
  //display: none;
}
</style>
