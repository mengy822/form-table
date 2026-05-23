<template>
  <el-config-provider :locale="language">
    <el-card shadow="hover" class="table-plus">
      <template #header>
        <slot name="header">
          <el-row :gutter="10">
            <el-col :span="1.5" v-if="hasAdd && proxyProps[`onAdd`]">
              <el-button
                :loading="operationLoading"
                type="primary"
                :plain="hasTableTopPlain"
                :icon="hasAddIcon"
                @click.stop="handleAdd()"
              >
                {{ typeof hasAdd !== 'boolean' ? hasAdd : '新增' }}
              </el-button>
            </el-col>
            <el-col
              :span="1.5"
              v-if="hasSelection && hasBatchRemove && proxyProps[`onBatchRemove`]"
            >
              <el-button
                :loading="operationLoading"
                :disabled="multipleSelection.length == 0"
                :type="hasBatchRemoveType"
                :plain="hasTableTopPlain"
                :icon="hasBatchRemoveIcon"
                @click.stop="handleBatchRemove()"
              >
                {{ typeof hasBatchRemove !== 'boolean' ? hasBatchRemove : '批量删除' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="hasExport && proxyProps[`onExport`]">
              <el-button
                :loading="operationLoading"
                type="warning"
                :plain="hasTableTopPlain"
                :icon="hasExportIcon"
                @click.stop="handleExport()"
              >
                {{ typeof hasExport !== 'boolean' ? hasExport : '导出' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="hasImport && proxyProps[`onImport`]">
              <el-button
                :loading="operationLoading"
                type="info"
                :plain="hasTableTopPlain"
                :icon="hasImportIcon"
                @click.stop="handleImport()"
              >
                {{ typeof hasImport !== 'boolean' ? hasImport : '导入' }}
              </el-button>
            </el-col>
            <el-col :span="1.5" v-if="slots['tableOperation']">
              <slot
                name="tableOperation"
                :data="operationData"
                :plain="hasTableTopPlain"
                :loading="operationLoading"
              ></slot>
            </el-col>
            <right-toolbar
              :search="proxyProps['onUpdate:showSearch']"
              v-model:showSearch="showSearch"
              v-model:columns="canHiddenColumns"
              @queryTable="handleQuery(undefined, false)"
            ></right-toolbar>
          </el-row>
        </slot>
      </template>
      <!-- :estimated-row-height="rowHeightInner" -->
      <el-table-v2
        ref="tableRef"
        class="table-plus-main"
        :height="height || heightInner"
        :columns="tableColumnFinal"
        :data="dataListComputed"
        :row-height="rowHeightInner"
        :row-class="rowClassName"
        :header-class="headerRowClassName"
        :width="width || widthInner"
        :fixed="
          hasOperationComputed ||
          hasIndexComputed ||
          hasSelectionComputed ||
          !!tableColumnFinal.find((item) => item.fixed)
        "
        :expand-column-key="expandColumnKey"
        :cell-props="cellProps"
        :class="kls"
        v-model:expanded-row-keys="expandedRowKeys"
        @row-expand="tableRowStatusChange"
        @expanded-rows-change="handleCurrentChange"
      >
        <template #overlay v-if="loading">
          <slot name="overlay">
            <div
              v-show="loading"
              class="el-loading-mask"
              style="display: flex; align-items: center; justify-content: center"
            >
              <el-icon class="is-loading" color="var(--el-color-primary)" :size="26">
                <Loading />
              </el-icon>
            </div>
          </slot>
        </template>
      </el-table-v2>
      <div v-if="hasPage && !isTree" v-show="totalComputed > 0">
        <pagination
          class="table-plus-pagination"
          :total="totalComputed"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handleQuery"
          :layout="pageLayout"
          :pagerCount="pagerCount"
        >
          <template #extra>
            <span :key="key" v-for="(value, key, index) in extra" class="extra">
              <span v-if="index === 0">&nbsp;</span>
              {{ key }} :{{ value }}
            </span>
          </template>
        </pagination>
      </div>
    </el-card>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyTableV2">
import {
  type Component,
  computed,
  type CSSProperties,
  getCurrentInstance,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  useTemplateRef,
  type VNode,
  watch,
  useAttrs,
  resolveComponent,
  h,
  onBeforeUnmount,
} from 'vue'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import {
  Delete,
  Download,
  Edit,
  Plus,
  Sort,
  SortDown,
  SortUp,
  Upload,
  View,
} from '@element-plus/icons-vue'
import {
  Column,
  ElCheckbox,
  ElIcon,
  ElMessage,
  ElMessageBox,
  ElTooltip,
  SortBy,
  SortState,
  TableV2Instance,
} from 'element-plus'

import {
  deepClone,
  getComputedStyle,
  getHeight,
  getRemainingHeight,
  getZoomPercent,
} from '../js/utils'
import TableOperations, { ButtonType, dataItemType } from '../components/TableOperations/index.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useListenDomChange } from '../utils/hooks'
import { handleFileDownload, request } from '../js'
import {
  Primitive,
  TableButtonType,
  ObjectType,
  FunType,
  FunctionType,
  ObjectBaseType,
} from '../js/types'
import FunctionAnalyzer from '../utils/FunctionAnalyzer'
import { CellRenderProps, HeaderRenderProps, TableColumn } from '../TableV2/types'

interface IsTreeConfig {
  id: string
  parentId: string
  children: string
  firstParentId: string
}

// 定义 Props 类型（提取为独立接口，增强可读性和复用性）
export interface TableProps {
  /** 是否显示分页 */
  hasPage: boolean

  moreButton: string
  moreButtonType?: ButtonType
  moreButtonTrigger?: 'hover' | 'click'
  simpTransVar: number
  /** 表格顶部按钮Plain */
  hasTableTopPlain: boolean
  pageLayout: string
  pagerCount: number
  /**是树结构*/
  isTree?: boolean | IsTreeConfig
  /** 是否懒加载（树形结构） */
  lazy: boolean
  /** 树形结构是否默认展开所有节点 */
  defaultExpandAll: boolean
  /** 懒加载数据加载函数 */
  loadFun: (row: Primitive, treeNode: unknown, resolve: (data: Primitive[]) => void) => void
  /** 树形结构配置（子节点字段、是否有子节点字段） */
  treeProps: { children: string; hasChildren: string }
  /** 语言配置 */
  language: object
  /** 是否显示序号列（布尔值或自定义列名） */
  hasIndex: boolean | string
  /** 是否显示选择列（支持函数动态控制） */
  hasSelection: boolean | ((row: { [key: string]: Primitive }, index: number) => boolean)
  /** 是否显示操作列（布尔值或自定义列名） */
  hasOperation: boolean | string
  /** 操作列总宽度 */
  operationWidth: number | undefined
  /** 单个操作按钮宽度 */
  oneOperationWidth: number
  /** 是否显示操作列标题 */
  hasOperationName: boolean
  /** 表格固定高度 */
  height: number | undefined
  /** 表格固定宽度 */
  width: number | undefined
  /** 表格行固定高度 */
  rowHeight: number | undefined
  /** 基础样式类（用于计算高度等） */
  baseClass: string
  //表格自动高度排除class
  autoHeightExcludeClassName: string[]
  //默认对齐
  align: 'center' | 'left' | 'right'
  // 操作列对齐方式
  operationAlign: 'center' | 'left' | 'right'
  operationFixed?: false | 'left' | 'right'
  hasIndexFixed?: false | 'left' | 'right'
  /** 是否启用最大宽度限制 */
  maxWidth: boolean
  /** 是否显示【新增】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasAdd: TableButtonType
  /** 【新增】按钮图标配置 */
  hasAddIcon: object
  /** 是否显示【批量删除】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasBatchRemove: TableButtonType
  /** 【批量删除】按钮图标配置 */
  hasBatchRemoveIcon: object
  /** 【批量删除】按钮类型 */
  hasBatchRemoveType: ButtonType
  /** 是否显示【导入】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasImport: TableButtonType
  /** 【导入】按钮图标配置 */
  hasImportIcon: object
  /** 是否显示【导出】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasExport: TableButtonType
  /** 【导出】按钮图标配置 */
  hasExportIcon: object
  /** 操作按钮是否显示文本 */
  hasOperationText: boolean
  /** 操作按钮是否显示链接样式 */
  hasOperationLink: boolean
  /** 是否显示【详情】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasDetail: TableButtonType
  /** 【详情】按钮图标配置 */
  hasDetailIcon: object
  /** 【详情】按钮类型（对应 UI 库按钮类型） */
  hasDetailType: ButtonType
  /** 是否显示【新增子节点】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasAddSon: TableButtonType
  /** 【新增子节点】按钮图标配置 */
  hasAddSonIcon: object
  /** 【新增子节点】按钮类型（对应 UI 库按钮类型） */
  hasAddSonType: ButtonType
  /** 是否显示【修改】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasUpdate: TableButtonType
  /** 【修改】按钮图标配置 */
  hasUpdateIcon: object
  /** 【修改】按钮类型（对应 UI 库按钮类型） */
  hasUpdateType: ButtonType
  /** 是否显示【删除】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasRemove: TableButtonType
  /** 【删除】按钮图标配置 */
  hasRemoveIcon: object
  /** 【删除】按钮类型（对应 UI 库按钮类型） */
  hasRemoveType: ButtonType
  /** 表格列配置（必填） */
  tableColumn: tableColumnItem[]
  /** 查询参数配置 */
  queryParam?: queryParamType
  /** 删除确认提示文本 */
  removeMessage: string
  /** 删除确认弹窗类型 */
  removeType: 'warning' | 'info' | 'error' | 'success'
  /** 删除确认弹窗标题 */
  removeMessageTitle: string
  /** 导出确认提示文本（false 表示不显示确认） */
  exportMessage: string | boolean
  /** 导出确认弹窗类型 */
  exportType: 'warning' | 'info' | 'error' | 'success'
  /** 导出确认弹窗标题 */
  exportMessageTitle: string
  /** 表格数据源（树形结构数据） */
  dataList: Array<ObjectType> | undefined
  /** 数据源加载函数 */
  dataListFun?: (
    query: {
      [key: string]: Primitive
    },
    cb: (res: string | Promise<ObjectType> | Primitive[], ...obj: Primitive[]) => void
  ) => void
  dataLoadFun?: FunctionType
  /** 数据源格式配置（数据列表字段、总数字段） */
  dataConfig: { rows: string; total: string; extra: string }
  /** 数据总数（用于分页） */
  total: number
  /** 是否高亮当前行 */
  highlightCurrentRow: boolean
  /** 当前行 Key（用于高亮/选中） */
  currentRowKey: string | number
  /** 行 className 配置（支持固定字符串或回调函数） */
  rowClassName: string | ((data: { row: ObjectType; rowIndex: number }) => string)
  /** 行样式配置（支持固定对象或回调函数） */
  rowStyle: CSSProperties | ((data: { row: ObjectType; rowIndex: number }) => CSSProperties)
  /** 单元格 className 配置（支持固定字符串或回调函数） */
  cellClassName:
    | string
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => string)
  /** 单元格样式配置（支持固定对象或回调函数） */
  cellStyle:
    | CSSProperties
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => CSSProperties)
  /** 表头行 className 配置（支持固定字符串或回调函数） */
  headerRowClassName: string | ((data: { row: Primitive; rowIndex: number }) => string)
  /** 表头行样式配置（支持固定对象或回调函数） */
  headerRowStyle: CSSProperties | ((data: { row: ObjectType; rowIndex: number }) => CSSProperties)
  /** 表头单元格 className 配置（支持固定字符串或回调函数） */
  headerCellClassName:
    | string
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => string)
  /** 表头单元格样式配置（支持固定对象或回调函数） */
  headerCellStyle:
    | CSSProperties
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => CSSProperties)
  /** 行 Key 配置（用于优化渲染和树形/选择功能） */
  rowKey: string | ((row: ObjectType) => string)
  /** 空数据提示文本 */
  emptyText: string
  /** 操作成功提示时长（毫秒） */
  duration: number
  /** 操作成功提示文本 */
  message: string
  /** 默认空白占位符 */
  defaultBlock: string
  /** 删除成功的状态码 */
  status?: number | boolean | string
  /** 删除成功的状态码字段 */
  code?: string
  /**导出的默认下载方式*/
  downFun?: FunctionType
  /** 默认排序方式 本地/远程*/
  sortable?: boolean
  sortableConfig?: { desc: string | number | boolean; asc: string | number | boolean }
  searchSortableConfig?: { fieId: string; fieVal: string }
}
export interface query extends queryParamType {
  pageSize: number
  pageNum: number
}

export interface queryParamType {
  [key: string]: string | number | undefined | boolean
}

export interface tableColumnItem {
  prop: string
  label: string
  isTable?: boolean
  isForm?: boolean
  showOverflow?: boolean
  width?: number
  unit?: string | ((row: object, prop: string, other: object) => string) //单位
  sortFun?: FunctionType
  sort?: boolean | 'custom'
  sortable?: boolean | 'custom'
  sortProp?: string
  hidden?: boolean
  visible?: boolean
  align?: 'center' | 'left' | 'right'
  fixed?: false | true | 'left' | 'right'
  selectable?: boolean
  maxWidth?: boolean
  decimalPlaces?: number
  fun?: FunType
  funDom?: FunType
  type?: 'number' | 'string'
  classFun?: (
    row: ObjectType,
    prop: string,
    other?: {
      index?: number
      [key: string]: Primitive
    }
  ) => string
  showFun?: (
    row?: queryParamType | Primitive,
    other?: {
      index?: number
      [key: string]: Primitive
    }
  ) => boolean
  slot?: string
  // render?: any
  header?:
    | string
    | ((
        row: ObjectType,
        prop: string,
        other?: {
          index?: number

          [key: string]: Primitive
        }
      ) => string | VNode | Component)

  list?: tableColumnItem[]
}

const slots = useSlots()
const attrs = useAttrs()
//表格固定列控制显示的计算属性
//多选
const hasSelectionComputed = computed(() => {
  return props.hasSelection
})
//index
const hasIndexComputed = computed(() => {
  return props.hasIndex && !props.isTree
})
//操作列
const hasOperationComputed = computed(() => {
  return (
    props.hasOperation &&
    ((props.hasAddSon && proxyProps.value[`onAddSon`]) ||
      (props.hasDetail && proxyProps.value[`onDetail`]) ||
      (props.hasUpdate && proxyProps.value[`onUpdate`]) ||
      (props.hasRemove && proxyProps.value[`onRemove`]) ||
      slots['operationBefore'] ||
      slots['operationAfterAddSon'] ||
      slots['operationAfterDetail'] ||
      slots['operationAfterUpdate'] ||
      slots['operationAfter'] ||
      slots['addSon'] ||
      slots['detail'] ||
      slots['update'] ||
      slots['remove'])
  )
})

// 使用 withDefaults 定义 Props 并配置默认值
const props = withDefaults(defineProps<TableProps>(), {
  // 基础配置
  hasPage: true,
  moreButton: '更多',
  moreButtonType: 'primary',
  moreButtonTrigger: 'hover',
  simpTransVar: 0,

  hasTableTopPlain: true,
  isTree: false,
  downFun: () => '',
  //删除成功的状态码
  status: 0,
  //删除成功的状态码字段
  code: 'code',
  lazy: true,
  defaultExpandAll: false,
  loadFun: undefined,
  dataLoadFun: () => '',
  treeProps: () => ({ children: 'children', hasChildren: 'hasChildren' }),
  language: () => zhCn,
  hasIndex: true,
  hasSelection: false,
  hasOperation: true,
  operationWidth: undefined,
  pagerCount: undefined,
  pageLayout: undefined,
  oneOperationWidth: 70,
  hasOperationName: true,
  maxHeight: undefined,
  height: undefined,
  width: undefined,
  rowHeight: 50,
  baseClass: '.app-main',
  autoHeightExcludeClassName: () => [],
  maxWidth: true,
  sortable: true,
  sortableConfig: () => ({ asc: 'asc', desc: 'desc' }),
  searchSortableConfig: () => ({ fieVal: 'order', fieId: 'sidx' }),
  // 顶部操作按钮（新增/批量删除/导入/导出）
  hasAdd: true,
  hasAddIcon: () => Plus,
  hasBatchRemove: true,
  hasBatchRemoveIcon: () => Delete,
  hasImport: true,
  hasImportIcon: () => Upload,
  hasExport: true,
  hasExportIcon: () => Download,

  // 操作列通用配置
  hasOperationText: true,
  hasOperationLink: true,

  // 行内操作按钮（详情）
  hasDetail: '详情',
  hasDetailIcon: () => View,
  hasDetailType: () => 'primary',

  // 行内操作按钮（新增子节点）
  hasAddSon: '新增',
  hasAddSonIcon: () => Plus,
  hasAddSonType: () => 'primary',

  // 行内操作按钮（修改）
  hasUpdate: '修改',
  hasUpdateIcon: () => Edit,
  hasUpdateType: () => 'primary',

  // 行内操作按钮（删除）
  hasRemove: '删除',
  hasRemoveIcon: () => Delete,
  hasRemoveType: () => 'danger',
  hasBatchRemoveType: () => 'danger',
  align: 'left',
  operationAlign: 'center',
  hasIndexFixed: 'left',
  operationFixed: 'right',
  // 表格核心配置
  tableColumn: undefined, // 注：原代码中为 required: true，此处需保留 undefined（TS 会强制校验必填）
  queryParam: undefined,

  // 弹窗提示配置
  removeMessage: '您确定删除该数据吗? 警告:该操作不可逆,请慎重操作',
  removeType: 'warning',
  removeMessageTitle: '警告',
  exportMessage: '是否确认导出数据?',
  exportType: 'warning',
  exportMessageTitle: '提示',

  // 数据源配置
  dataList: undefined,
  dataListFun: undefined,
  dataConfig: () => ({ rows: 'rows', total: 'total', extra: 'extra' }),
  total: 0,

  // 表格样式与交互配置
  highlightCurrentRow: false,
  currentRowKey: '',
  rowClassName: '',
  rowStyle: () => ({}),
  cellClassName: '',
  cellStyle: () => ({}),
  headerRowClassName: '',
  headerRowStyle: () => ({}),
  headerCellClassName: '',
  headerCellStyle: () => ({}),
  rowKey: '',
  emptyText: '没有数据',

  // 提示配置
  duration: 1500,
  message: '操作成功',
  defaultBlock: '-',
})
//表格实例
const tableRef = useTemplateRef<TableV2Instance>('tableRef')
const heightInner = ref<number>(0)
const widthInner = ref<number>(0)
const rowHeightInner = ref<number>(props.rowHeight)
const maxHeightInner = ref<number>(0)

const totalInner = ref<number>(0)
const dataListInner = ref<ObjectType[]>([])
const totalComputed = computed<number>({
  get: () => {
    return props.total || totalInner.value
  },
  set: (val: number) => {
    totalInner.value = val
  },
})
const extra = ref<{ [key: string]: Primitive }>({})
const dataListComputed = computed({
  get: () => {
    return props.dataList || dataListInner.value
  },
  set: (val) => {
    dataListInner.value = val
  },
})
const proxyProps = ref<{
  [key: string]: boolean
}>({
  onAdd: false,
  onUpdate: false,
  onDetail: false,
  onRemove: false,
  onAddSon: false,
  onDataLoadCompleted: false,
  'onUpdate:showSearch': false,
})
const proxyPropsParamsInfo = ref<{
  [key: string]: boolean
}>({
  onAdd: false,
  onUpdate: false,
  onDetail: false,
  onRemove: false,
  onAddSon: false,
  onDataLoadCompleted: false,
  'onUpdate:showSearch': false,
})
const handleResize = () => {
  heightChange()
}
const needAutoHeight = ref(true)
watch(
  () => needAutoHeight.value,
  (newVal) => {
    if (needAutoHeight.value) {
      window.addEventListener('resize', handleResize)
    } else {
      window.removeEventListener('resize', handleResize)
    }
  },
  {
    immediate: true,
  }
)
onMounted(() => {
  needAutoHeight.value = true
  const internal = getCurrentInstance()
  const onEmit = (internal?.vnode.props || {}) as Record<string, Primitive>
  for (const emit in onEmit) {
    proxyProps.value[emit] = typeof onEmit[emit] === 'function'
    if (proxyProps.value[emit]) {
      const funInfo = FunctionAnalyzer.analyzeParameters(onEmit[emit])
      // console.log(funInfo.parameters.find((item) => item.name === 'cb' || item.name === 'callback'));
      if (
        funInfo.parameterCount > 0 &&
        funInfo.parameters.find(
          (item: { name: string }) => item.name === 'cb' || item.name === 'callback'
        )
      ) {
        proxyPropsParamsInfo.value[emit] = true
      }
    }
  }
  heightChange()
})

onBeforeUnmount(() => {
  needAutoHeight.value = false
})
onDeactivated(() => {
  needAutoHeight.value = false
})
onActivated(() => {
  needAutoHeight.value = true
})
const operationWidthComputed = computed(() => {
  let width = props.operationWidth ?? 100
  if (props.simpTransVar > 0) {
    return props.operationWidth || props.oneOperationWidth * (props.simpTransVar + 1)
  }
  if (typeof props.operationWidth === 'undefined') {
    let i = 0
    for (const proxyProp of ['onAddSon', 'onUpdate', 'onRemove', 'onDetail']) {
      if (proxyProps.value[proxyProp]) {
        width += props.oneOperationWidth
        i++
      }
    }
    if (i === 0) {
      width = 70
    } else if (i >= 1) {
      width -= 80
    }
  }
  return width
})
const listenDoc = useListenDomChange(() => {
  heightChange()
})
const getOperationLabel = (
  hasXXX: typeof props.hasDetail,
  scope: {
    row: ObjectType
    $index: number
  },
  defaultLabel: string
) => {
  const hasOperationName = props.hasOperationName
  if (typeof hasXXX === 'boolean') {
    return defaultLabel
  }

  if (typeof hasXXX === 'function') {
    if (!hasOperationName) return ''

    const result = (hasXXX as FunctionType)(scope.row)
    return typeof result === 'boolean' ? defaultLabel : result
  }

  return hasXXX ?? defaultLabel
}
let timer: any = null
const heightChange = () => {
  clearTimeout(timer)
  const zoom = getZoomPercent()
  const url = window.location.href
  const width = window.innerWidth
  const height = window.innerHeight
  const key = `${zoom}${url}${width}${height}`
  const oldheight = Number(localStorage.getItem(key) || 0)
  if (oldheight && oldheight > 0) {
    heightInner.value = Number(oldheight)
    maxHeightInner.value = oldheight
    console.log('使用上次计算结果', heightInner.value)
    // return;
  }
  timer = setTimeout(() => autoHeight(key), 500)
}

const autoHeight = (key: string) => {
  if (!needAutoHeight.value) return
  // console.log('重建dom', props.baseClass, new Date().getTime());
  nextTick(() => {
    if (props.baseClass && typeof props.height == 'undefined') {
      const tableHeaderHeight = getHeight('.el-card__header') //+ getHeight('.el-table__header-wrapper');
      const pageHeight = getHeight('.pagination-container')
      const {
        paddingTop: bodyPaddingTop,
        paddingRight: bodyPaddingRight,
        paddingLeft: bodyPaddingLeft,
        paddingBottom: bodyPaddingBottom,
      } = getComputedStyle('.table-plus .el-card__body')
      const { borderTopWidth, borderBottomWidth } = getComputedStyle('.table-plus .el-card__header')
      const { width } = getComputedStyle('.table-plus')
      widthInner.value =
        Number(width.replace('px', '')) -
        Number(bodyPaddingRight.replace('px', '')) -
        Number(bodyPaddingLeft.replace('px', ''))
      const { height, dom } = getRemainingHeight(props.baseClass, [
        '.table-plus',
        ...props.autoHeightExcludeClassName,
      ])
      heightInner.value =
        height -
        tableHeaderHeight -
        pageHeight -
        parseFloat(bodyPaddingBottom) -
        parseFloat(bodyPaddingTop) -
        parseFloat(borderTopWidth) -
        parseFloat(borderBottomWidth)
      maxHeightInner.value = heightInner.value
      localStorage.setItem(key, String(heightInner.value))
      // console.log(heightInner.value);
      dom.forEach((item) => {
        listenDoc.listen(item)
      })
      if (props.hasPage) listenDoc.listen('.pagination-container')
      // listenDoc.listen('.el-table__header-wrapper');
    }
  })
}
//需要隐藏的表格列
const canHiddenColumns = computed({
  get() {
    return deepClone(tableColumn.value)
      .filter((item: { isTable: Primitive }) => item.isTable || typeof item.isTable === 'undefined')
      .map(
        (
          item: {
            prop: string
            label: string
            visible: boolean
            hidden: boolean
            width: number
            maxWidth: number
          },
          index: number
        ) => {
          return {
            key: item.prop,
            label: item.label,
            visible: item.visible ?? true,
            hidden: item.hidden,
            index: index,
            maxWidth: item.width ? false : item.maxWidth ?? props.maxWidth,
          }
        }
      )
      .filter((item: { hidden: true }) => item.hidden)
  },
  set(data) {
    data.forEach((item: { index: number; visible: boolean | undefined }) => {
      tableColumn.value[item.index].visible = item.visible
    })
  },
})
const selectedRows = ref(new Set())
// 切换行选择状态
const toggleRowSelection = (row: string) => {
  if (selectedRows.value.has(row)) {
    selectedRows.value.delete(row)
  } else {
    selectedRows.value.add(row)
  }
}
const allSelected = computed(() => {
  return (
    dataListComputed.value.length > 0 &&
    selectedRows.value.size ==
      new Set([
        ...selectedRows.value,
        ...dataListComputed.value
          .map((item, index) => {
            if (hasSelection.value(item, index)) return JSON.stringify(item)
          })
          .filter((item) => item),
      ]).size
  )
})
const indeterminate = computed(() => {
  return selectedRows.value.size > 0 && !allSelected.value
})
// 全选/取消全选
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRows.value.clear()
  } else {
    dataListComputed.value.forEach((row, index) => {
      if (hasSelection.value(row, index)) selectedRows.value.add(JSON.stringify(row))
    })
  }
}
// 清空选择
const clearSelection = () => {
  selectedRows.value.clear()
}

// 创建省略单元格渲染器
const createEllipsisCellRenderer = ({
  showTooltip = true,
  tooltipPlacement = 'top',
  fun,
  classFun,
  ofun,
  type = undefined,
}: {
  type: 'string' | 'number' | undefined
  ofun?: (
    row: ObjectType,
    prop: string,
    other: ObjectType & { renderTxt: (context: string) => string }
  ) => string
  fun:
    | ((
        row: ObjectType,
        prop: string,
        other: ObjectType & { renderTxt: (context: string) => string }
      ) => string | VNode | Component)
    | ((scope: ObjectType) => VNode | Component)
  classFun: (row: ObjectType, prop: string, other: ObjectType) => string
  tooltipPlacement: string
  showTooltip: boolean
}) => {
  return ({
    cellValue: cellData,
    rowIndex,
    column,
    rowData,
  }: {
    rowData: ObjectType
    rowIndex: number
    cellValue: Primitive
    column: ObjectType
  }) => {
    const separator = [',', '~', '-', '/']
    const nowSeparator = separator.find((item) => (column['dataKey'] as string).indexOf(item) > -1)
    if (fun.toString().indexOf('(...args)') > -1) {
      const originFun = ofun || ((row, prop) => row[prop])
      return fun({ row: rowData, prop: column.dataKey, fun: originFun }, null, null)
    }
    if (!type) {
      type = typeof rowData[column['dataKey']] === 'number' ? 'number' : 'string'
    }
    const funData = fun(rowData, column['dataKey'] as string, {
      renderTxt: (context: string) =>
        type === 'number' ? context ?? props.defaultBlock : context || props.defaultBlock,
      ...attrs,
      index: rowIndex,
    })
    const content =
      type === 'number' ? funData ?? props.defaultBlock : funData || props.defaultBlock
    const style: { width: string; overflow?: string; textOverflow?: string; whiteSpace?: string } =
      {
        width: `auto`, // 减去 padding
      }
    if (showTooltip) {
      style.overflow = 'hidden'
      style.textOverflow = 'ellipsis'
      style.whiteSpace = 'nowrap'
    }
    // 创建单元格内容容器
    const cellContent = h(
      'div',
      {
        class: `span span_${column['dataKey'] as string} span_${column['dataKey'] as string}_${
          cellData as string
        } ${typeof cellData} ellipsis-content ${classFun(
          rowData,
          column['dataKey']! as string,
          {}
        )} key_${column['dataKey']! as string}_prop`,
        style,
      },
      {
        default: () => [content],
      }
    )

    // 如果不需要 tooltip，直接返回
    if (!showTooltip || typeof content == 'object' || (content as string) == props.defaultBlock) {
      return cellContent
    }

    // 需要 tooltip 的情况
    return h(
      ElTooltip,
      {
        placement: tooltipPlacement,
        content: content as string,
        showOverflowTooltip: true,
        // onBeforeShow: (instance) => {
        //   // const { fromElement } = instance;
        //   // console.log('Tooltip 即将显示', instance, cellContent.props.class?.split(' '), fromElement.clientWidth, fromElement.scrollWidth);
        //   // 可以进行一些验证function bijiao(cname) {
        //   //   return document.querySelector(cname).clientWidth<document.querySelector(cname).scrollWidth
        //   // }
        //   return false; //fromElement.clientWidth < fromElement.scrollWidth; // 返回 true 允许显示，false 阻止显示
        // }
      },
      {
        default: () => [cellContent],
      }
    )
  }
}

const tableColumn = ref<typeof props.tableColumn>(props.tableColumn)
const slotContentCache = new Map<string, VNode[]>()
// 获取 slot 的虚拟节点内容
function getSlotContent(
  scope_data: {
    data: ObjectType
    index: number
    text: boolean
    link: boolean
    loading: boolean
  } = {
    data: {},
    index: 0,
    text: false,
    link: false,
    loading: false,
  }
) {
  // 生成唯一缓存key（使用行数据的唯一标识）
  const cacheKey = JSON.stringify({
    rowId: scope_data.data, // 确保有唯一id
    rowIndex: scope_data.index,
    hasAddSon: typeof props.hasAddSon === 'function' ? 'func' : props.hasAddSon,
    hasDetail: typeof props.hasDetail === 'function' ? 'func' : props.hasDetail,
    hasUpdate: typeof props.hasUpdate === 'function' ? 'func' : props.hasUpdate,
    hasRemove: typeof props.hasRemove === 'function' ? 'func' : props.hasRemove,
    // isSimpTransVar: props.isSimpTransVar,
  })

  if (slotContentCache.has(cacheKey)) {
    return slotContentCache.get(cacheKey)
  }
  // console.log(scope_data.index, 'scope_data.index')
  // const slotKeys = Object.keys(slots).filter((item) => item.indexOf('operation') > -1);
  const allSlotName = [
    'operationBefore',
    'addSon',
    'operationAfterAddSon',
    'detail',
    'operationAfterDetail',
    'update',
    'operationAfterUpdate',
    'remove',
    'operationAfter',
  ] as const
  const defaultButtonShowFun: {
    addSon: boolean | string
    detail: boolean | string
    update: boolean | string
    remove: boolean | string
  } = {
    addSon:
      typeof props.hasAddSon === 'function'
        ? props.hasAddSon(scope_data.data)
        : props.hasAddSon && proxyProps.value[`onAddSon`],
    detail:
      typeof props.hasDetail === 'function'
        ? props.hasDetail(scope_data.data)
        : props.hasDetail && proxyProps.value[`onDetail`],
    update:
      typeof props.hasUpdate === 'function'
        ? props.hasUpdate(scope_data.data)
        : props.hasUpdate && proxyProps.value[`onUpdate`],
    remove:
      typeof props.hasRemove === 'function'
        ? props.hasRemove(scope_data.data)
        : props.hasRemove && proxyProps.value[`onRemove`],
  }
  const defaultButtonShowFunKey: (keyof typeof defaultButtonShowFun)[] = Object.keys(
    defaultButtonShowFun
  ) as Array<keyof typeof defaultButtonShowFun>
  const vnodesArr = []
  // console.log(allSlotName);
  for (const slotName of allSlotName) {
    const slot = slots[slotName]
    if (
      defaultButtonShowFunKey.includes(slotName as keyof typeof defaultButtonShowFun) &&
      defaultButtonShowFun[slotName as keyof typeof defaultButtonShowFun]
    ) {
      // if (nowUseSim < sim) {
      //   nowUseSim++;
      //   showTableButton.value.push(slotName);
      //   // continue;
      // }
      vnodesArr.push(slotName)
      continue
    }
    if (!slot) continue

    // 调用 slot 函数获取虚拟节点
    const vnodes = slot(scope_data)

    vnodesArr.push(...vnodes)
  }
  slotContentCache.set(cacheKey, vnodesArr)
  // console.log(146543634, vnodes);
  return vnodesArr
}
const hasSelection = computed(() =>
  typeof props.hasSelection === 'function' ? props.hasSelection : () => true
)
// 生成操作列的函数
function generateOperationColumn() {
  return ({ rowData: row, rowIndex: $index }: { rowData: ObjectType; rowIndex: number }) => {
    const slotContent = getSlotContent({
      data: row,
      index: queryParams.value.pageSize * (queryParams.value.pageNum - 1) + $index + 1,
      text: props.hasOperationText,
      link: props.hasOperationLink,
      loading: operationLoading.value,
    })!.filter((item: any) => item)
    return h(TableOperations, {
      align: props.operationAlign,
      scope: { row, $index },
      slots: slots,
      queryParams: queryParams.value,
      hasOperationText: props.hasOperationText,
      hasOperationLink: props.hasOperationLink,
      hasAddSon: props.hasAddSon,
      hasDetail: props.hasDetail,
      hasUpdate: props.hasUpdate,
      hasRemove: props.hasRemove,
      hasAddSonIcon: props.hasAddSonIcon,
      hasDetailIcon: props.hasDetailIcon,
      hasUpdateIcon: props.hasUpdateIcon,
      hasRemoveIcon: props.hasRemoveIcon,
      hasAddSonType: props.hasAddSonType,
      hasDetailType: props.hasDetailType,
      hasUpdateType: props.hasUpdateType,
      hasRemoveType: props.hasRemoveType,
      proxyProps: proxyProps.value,
      moreButton: props.moreButton,
      moreButtonType: props.moreButtonType,
      moreButtonTrigger: props.moreButtonTrigger,
      hasOperationName: !props.hasOperationName,
      operationLoading: operationLoading.value,
      getSlotContent: slotContent,
      simpTransVar: props.simpTransVar,
      onAddSon: handleAddSon,
      onDetail: handleDetail,
      onUpdate: handleUpdate,
      onRemove: handleRemove,
    })
    const ElTooltip = resolveComponent('ElTooltip')
    const ElButton = resolveComponent('ElButton')
    const template = (slot?: (...args: Primitive[]) => VNode | Component) => {
      if (!slot) return undefined
      return slot({
        data: row,
        index: $index,
        text: props.hasOperationText,
        link: props.hasOperationLink,
        loading: operationLoading.value,
      })
    }
    // 生成工具提示按钮的函数
    const generateTooltipButton = (
      condition: 'hasDetail' | 'hasAdd' | 'hasAddSon' | 'hasUpdate' | 'hasRemove' = 'hasDetail',
      label: string,
      handler: (row: ObjectType) => void,
      icon: object,
      type: string
    ) => {
      // 判断是否显示
      const shouldShow =
        typeof props[condition] === 'function'
          ? props[condition](row)
          : props[condition] && proxyProps.value[`on${condition.replace('has', '')}`]

      if (!shouldShow) return null

      const buttonContent = getOperationLabel(props[condition], { row, $index }, label)

      // 创建按钮
      const button = h(
        ElButton,
        {
          text: props.hasOperationText,
          link: props.hasOperationLink,
          type: type,
          loading: operationLoading.value,
          icon: icon,
          onClick: {
            handler: handler(row),
            stop: true, // 相当于 .stop 修饰符
          },
        },
        () => buttonContent
      )

      // 包装在 Tooltip 中
      return h(
        ElTooltip,
        {
          disabled: props.hasOperationName,
          content: `${buttonContent as string}`,
          placement: 'top',
        },
        {
          default: () => button,
        }
      )
    }
    // 收集所有要渲染的子节点
    const children: (VNode | Component | undefined | null)[] = []
    // 1. operationBefore 插槽
    if (slots.operationBefore) {
      children.push(template(slots.operationBefore))
    }

    // 2. addSon 插槽和按钮
    const addSonSlot = template(slots.addSon)

    const addSonButton = generateTooltipButton(
      'hasAddSon',
      '新增',
      handleAddSon,
      props.hasAddSonIcon,
      props.hasAddSonType
    )
    children.push(addSonSlot ?? addSonButton)

    // 3. operationAfterAddSon 插槽
    if (slots.operationAfterAddSon) {
      children.push(template(slots.operationAfterAddSon))
    }

    // 4. detail 插槽和按钮
    const detailSlot = template(slots.detail)

    const detailButton = generateTooltipButton(
      'hasDetail',
      '详情',
      handleDetail,
      props.hasDetailIcon,
      props.hasDetailType
    )
    children.push(detailSlot ?? detailButton)

    // 5. operationAfterDetail 插槽
    if (slots.operationAfterDetail) {
      children.push(template(slots.operationAfterDetail))
    }

    // 6. update 插槽和按钮
    const updateSlot = template(slots.update)

    const updateButton = generateTooltipButton(
      'hasUpdate',
      '修改',
      handleUpdate,
      props.hasUpdateIcon,
      props.hasUpdateType
    )

    children.push(updateSlot ?? updateButton)

    // 7. operationAfterUpdate 插槽
    if (slots.operationAfterUpdate) {
      children.push(template(slots.operationAfterUpdate))
    }

    // 8. remove 插槽和按钮
    const removeSlot = template(slots.remove)

    const removeButton = generateTooltipButton(
      'hasRemove',
      '删除',
      handleRemove,
      props.hasRemoveIcon,
      props.hasRemoveType
    )
    children.push(removeSlot ?? removeButton)

    // 9. operationAfter 插槽
    if (slots.operationAfter) {
      children.push(template(slots.operationAfter))
    }
    // console.log(children);
    // 返回包裹容器
    return h(
      'div',
      {
        class: 'operation-column',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        },
      },
      {
        default: () => [...children.filter((item) => item)],
      }
    )
  }
}
const cellProps = ({ columnIndex }: { columnIndex: number }) => {
  const key = `hovering-col-${columnIndex}`
  return {
    ['data-key']: key,
    onMouseenter: () => {
      kls.value = key
    },
    onMouseleave: () => {
      kls.value = ''
    },
  }
}
const kls = ref<string>('')
const tableColumnFinal = computed(() => {
  const TableColumn: TableColumn[] = []
  // if (tableColumn.value.length === 0) {
  if (hasSelectionComputed.value) {
    TableColumn.push({
      dataKey: 'index',
      key: 'index',
      title: '',
      width: Number(55),
      fixed: 'left',
      cellRenderer: (props: CellRenderProps) => {
        const { rowData, rowIndex } = props
        return h(ElCheckbox, {
          modelValue: selectedRows.value.has(JSON.stringify(rowData)),
          onChange: (checked) => toggleRowSelection(JSON.stringify(rowData)),
          onClick: (e: { stopPropagation: () => any }) => e.stopPropagation(),
          disabled: !hasSelection.value(rowData, rowIndex),
          value: JSON.stringify(rowData),
        })
      },
      headerCellRenderer: () => {
        return h(ElCheckbox, {
          modelValue: allSelected.value,
          indeterminate: indeterminate.value,
          onChange: toggleSelectAll,
          onClick: (e: { stopPropagation: () => any }) => e.stopPropagation(),
        })
      },
    })
  }
  if (hasIndexComputed.value) {
    TableColumn.push({
      dataKey: 'index',
      key: 'index',
      title: typeof props.hasIndex === 'boolean' ? '序号' : props.hasIndex,
      width: Number(60),
      fixed: props.hasIndexFixed,
      cellRenderer: (props: CellRenderProps) => {
        const { rowIndex } = props
        return h(
          'div',
          {},
          queryParams.value.pageSize * (queryParams.value.pageNum - 1) + rowIndex + 1
        )
      },
      headerCellRenderer: (props: HeaderRenderProps) => {
        const { column } = props
        return h('span', {}, column.title)
      },
    })
  }
  TableColumn.push(
    ...deepClone(props.tableColumn)
      .filter(
        (item: { isTable: boolean | undefined }) =>
          item.isTable || typeof item.isTable === 'undefined'
      )
      .map((data: tableColumnItem, index: number) => {
        const item: TableColumn = {
          width: 0,
        }
        item.align = 'center'
        if (props.isTree && index === 0 && !props.hasSelection) {
          item.align = 'left'
        }
        // item.visible = data.visible ?? true;
        data.sortable = data.sort ?? data.sortable ?? false
        if (typeof data.sortable === 'string' && props.sortable) {
          data.sortable = true
        }
        if (typeof data.sortable === 'boolean' && !props.sortable) {
          // item.sortable = 'custom';
        }
        if (data.sortable) {
          // item.sortProp = data.sortProp ?? data.prop;
          sortProp.value[data.prop] = data.sortProp
          sortState.value[data.prop] = undefined
        }
        const separator = [',', '~', '-', '/']
        const nowSeparator = separator.find((item) => data.prop.indexOf(item) > -1)
        const vnodes = slots[data.prop]

        const fun =
          data.funDom ??
          vnodes ??
          data.fun ??
          ((
            row: ObjectType,
            prop: string,
            other: {
              index?: Primitive
              [key: string]: Primitive
              renderTxt: (context: string) => string
            }
          ) => {
            if (!data.type) {
              data.type = typeof row[prop] == 'number' ? 'number' : 'string'
            }
            let content
            if (nowSeparator) {
              const propArr = data.prop.split(nowSeparator)
              const fundatas: string[] = []
              propArr.forEach((item) => {
                const c =
                  data.type === 'number'
                    ? row[item] ?? props.defaultBlock
                    : row[item] || props.defaultBlock
                fundatas.push(String(c))
              })
              content = fundatas.join(nowSeparator)
            } else {
              let propss = [prop]
              if (prop.indexOf('.') > -1) {
                propss = prop.split('.')
              }
              let lscontent = row[propss[0]]
              for (let i = 1; i < propss.length; i++) {
                const item1 = propss[i]
                lscontent = (lscontent as ObjectType)?.[item1] || undefined
              }
              content = String(
                data.type === 'number'
                  ? (lscontent as number).toFixed(
                      data.decimalPlaces ||
                        0 ||
                        Number((String(lscontent).split('.')[1] || '').length || 0)
                    ) ?? props.defaultBlock
                  : lscontent || props.defaultBlock
              )
            }

            const unit =
              typeof data.unit == 'string'
                ? data.unit
                : (data.unit && data.unit(row, prop, other || {})) ?? ''

            return content != props.defaultBlock ? content + unit : content
          })

        data.classFun =
          data.classFun ??
          (() => {
            let content
            if (nowSeparator) {
              const props = data.prop.split(nowSeparator)
              content = props.join(' ')
            } else {
              content = data.prop
            }
            return content
          })
        item.dataKey = data.prop
        item.key = data.prop
        item.title = data.label
        item.width = Number(data.width ?? 100)
        // item.hidden = typeof data.showFun=='boolean'?data.
        item.cellRenderer = createEllipsisCellRenderer({
          fun: fun,
          classFun: data.classFun,
          showTooltip: data.showOverflow as boolean,
          tooltipPlacement: 'top',
          ofun: data.fun,
        })
        const header = data.header ?? (() => item.title!)
        let headerDom: VNode | string | Component = h('span', {}, header as string)
        if (typeof header != 'string') {
          headerDom = header!({ ...item, label: item.title }, item.dataKey)
        }
        if (typeof headerDom == 'string') {
          headerDom = h('span', {}, headerDom)
        }
        item.headerCellRenderer = (props: HeaderRenderProps) => {
          const { column } = props
          // console.log(props, '11111111111111');
          return h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: data.sortable ? 'pointer' : 'default',
              },
              // dataset: {
              //   sort: '123',
              // },
              'data-sort': '123',
              class: ``,
              onClick: () => {
                if (data.sortable) {
                  switch (sortState.value[data.prop]) {
                    case undefined:
                      sortState.value[data.prop] = 'desc'
                      break
                    case 'desc':
                      sortState.value[data.prop] = 'asc'
                      break
                    case 'asc':
                      sortState.value[data.prop] = undefined
                      break
                  }
                  onSort({
                    column: item,
                    key: item.dataKey! as string,
                    order: sortState.value[data.prop],
                  })
                }
              },
            },
            [
              headerDom as VNode,
              data.sortable &&
                h(
                  ElIcon,
                  {},
                  {
                    default: () =>
                      typeof sortState.value[data.prop] == 'undefined'
                        ? h(Sort)
                        : sortState.value[data.prop] == 'desc'
                        ? h(SortUp)
                        : h(SortDown),
                  }
                ),
            ]
          )
        }

        return item
      })
  )
  if (hasOperationComputed.value) {
    TableColumn.push({
      dataKey: 'operation',
      key: 'operation',
      title: typeof props.hasOperation === 'boolean' ? '操作' : props.hasOperation,
      width: operationWidthComputed.value,
      fixed: props.operationFixed,
      align: props.operationAlign,
      cellRenderer: generateOperationColumn(),
      headerCellRenderer: (props: HeaderRenderProps) => {
        const { column } = props
        return h('span', {}, column.title)
      },
    })
  }
  // }

  // console.log(JSON.stringify(TableColumn));

  return TableColumn
})
const sortState = ref<{ [key: string]: 'asc' | 'desc' | undefined }>({})

const onSort = ({
  column,
  key,
  order,
}: {
  column: TableColumn
  key: string
  order: 'desc' | 'asc' | undefined
}) => {
  sortState.value[key as string] = order
  if (typeof order !== 'undefined') {
    sortPropData.value[column.dataKey! as string] = props.sortableConfig[order]
  } else {
    delete sortPropData.value[column.dataKey! as string]
  }

  handleQuery()
}
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
// ======================== 新增：Emit 相关核心类型定义 ========================
// 1. 表格行数据类型（与 props.dataList 结构对齐）
type TableRowData = ObjectType // 复用组件内已定义的 ObjectType

// 2. 表格查询参数类型（与 queryParams 结构对齐，含分页信息）
type TableQueryParams = query // 复用组件内已定义的 query 类型

// 3. 导出操作的回调函数类型（用于控制导出加载状态）
type ExportCallback = (
  url?: string,
  params?: ObjectType,
  fileName?: string,
  methods?: 'get' | 'post'
) => void

// 4. 删除操作的回调函数类型（用于控制删除结果和加载状态）
type RemoveCallback = (flag: boolean | string | Promise<ObjectType>) => void

// 7. 所有 Emit 事件接口（覆盖组件所有触发场景）
interface MyTableEmits {
  /**
   * 表格查询事件（分页切换、条件搜索时触发）
   * @param eventName 事件名：固定为 'query'
   * @param params 查询参数（含分页信息）
   */
  (eventName: 'query', params: TableQueryParams): void

  /**
   * 新增按钮点击事件
   * @param eventName 事件名：固定为 'add'
   * @param callback
   */
  (eventName: 'add', callback?: RemoveCallback): void

  /**
   * 行内修改按钮点击事件
   * @param eventName 事件名：固定为 'update'
   * @param row 当前行数据
   * @param callback
   */
  (eventName: 'update', row: TableRowData, callback?: RemoveCallback): void

  /**
   * 行内详情按钮点击事件
   * @param eventName 事件名：固定为 'detail'
   * @param row 当前行数据
   * @param callback
   */
  (eventName: 'detail', row: TableRowData, callback?: RemoveCallback): void

  /**
   * 行内删除按钮点击事件
   * @param eventName 事件名：固定为 'remove'
   * @param row 当前行数据
   * @param callback 删除结果回调（控制加载状态和提示）
   */
  (eventName: 'remove', row: TableRowData, callback?: RemoveCallback): void

  /**
   * 搜索区域显示/隐藏切换事件
   * @param eventName 事件名：固定为 'update:showSearch'
   * @param visible 搜索区域显示状态（true 显示，false 隐藏）
   */
  (eventName: 'update:showSearch', visible: boolean): void

  /**
   * 批量删除按钮点击事件
   * @param eventName 事件名：固定为 'batch-remove'
   * @param selectedRows 选中的行数据列表（从 multipleSelection 提取）
   * @param callback
   */
  (eventName: 'batch-remove', selectedRows: TableRowData[], callback?: RemoveCallback): void

  /**
   * 导入按钮点击事件
   * @param eventName 事件名：固定为 'import'
   * @param callback
   */
  (eventName: 'import', callback?: RemoveCallback): void

  /**
   * 导出按钮点击事件（含选中行筛选）
   * @param eventName 事件名：固定为 'export'
   * @param exportData 导出参数（含查询条件和选中行）
   * @param callback 导出完成回调（控制加载状态）
   */
  (
    eventName: 'export',
    exportData: {
      [key: string]: Primitive // 扩展字段（如查询条件）
      multipleSelection: ObjectType[] // 选中的行数据（用于批量导出）
    },
    callback?: ExportCallback
  ): void

  /**
   * 数据加载完成事件（通过 dataListFun 加载数据后触发）
   * @param eventName 事件名：固定为 'dataLoadCompleted'
   * @param datas 加载完成的数据列表
   * @param total 数据总数（用于分页）
   */
  (eventName: 'dataLoadCompleted', datas: TableRowData[], total: number): void

  /**
   * 树形表格展开/折叠事件
   * @param eventName 事件名：固定为 'expand-change'
   * @param row 被展开/折叠的行数据
   * @param expanded 展开状态（布尔值或展开的子行列表）
   */
  (eventName: 'expand-change', row: TableRowData, expanded: boolean | TableRowData[]): void

  /**
   * 行内新增子节点按钮点击事件（树形表格专用）
   * @param eventName 事件名：固定为 'add-son'
   * @param parentRow 父行数据（新增子节点的上级）
   * @param callback
   */
  (eventName: 'add-son', parentRow: TableRowData, callback?: RemoveCallback): void

  /**
   * 行内新增子节点按钮点击事件（树形表格专用）
   * @param eventName 事件名：固定为 'current-change'
   * @param val 被选中的行数据
   */
  (eventName: 'current-change', val: TableRowData): void

  /**
   * 行内自定义按钮点击事件
   * @param eventName 事件名：固定为 'custom-event'
   * @param row 当前行数据
   * @param callback 删除结果回调（控制加载状态和提示）
   */
  (
    eventName: 'custom-event',
    row: {
      eventName: string
      data: ObjectType
    },
    callback: RemoveCallback
  ): void
}
// ========================================================================
const emits = defineEmits<MyTableEmits>()

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
//树形表格存储原始数据
const originalData = ref<Primitive[]>()
//树形表格存储子数据
const dataChildrenListMap = ref<{ [key: string]: Primitive[] }>({})
//树形表格存储展开子数据
const dataExpandMap = ref<{
  [key: string]: { row: ObjectType; treeNode: ObjectType; resolve: FunctionType }
}>({})
const treeConfig = ref<IsTreeConfig>(undefined)

//多选数据
const multipleSelection = computed(() => {
  return Array.from(selectedRows.value).map((item) => JSON.parse(item))
})
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
const expandColumnKey = ref('')
const expandedRowKeys = ref<string[]>([])
//行展开
const tableRowStatusChange = (row: ObjectType, expandedRows: ObjectType[] | boolean): void => {
  // console.log(expandedRows, '行展开')
  if (proxyProps.value['onExpandChange']) emits('expand-change', row, expandedRows)
  else if (!expandedRows) {
    delete dataExpandMap.value[String(row[treeConfig.value.id])]
  }
}
const handleCurrentChange = (val: ObjectType) => {
  if (proxyProps.value['onCurrentChange']) emits('current-change', val)
}
const setCurrentRow = (val: ObjectType) => {
  tableRef.value?.setCurrentRow(val)
}
//排序参数键名对照
const sortProp = ref<ObjectBaseType>({})
//排序数据
const sortPropData = ref<ObjectBaseType>({})
const sortPropDataComputed = computed(() => {
  const queryParam = {
    [props.searchSortableConfig.fieId]: '',
    [props.searchSortableConfig.fieVal]: '',
  }
  for (const sortPropDatum in sortPropData.value) {
    if (typeof sortPropData.value[sortPropDatum] == 'undefined') continue
    queryParam[props.searchSortableConfig.fieId] += ',' + sortPropDatum
    queryParam[props.searchSortableConfig.fieVal] += ',' + sortPropData.value[sortPropDatum]
  }
  if (queryParam[props.searchSortableConfig.fieId].length > 0) {
    queryParam[props.searchSortableConfig.fieId] =
      queryParam[props.searchSortableConfig.fieId].slice(1)
    queryParam[props.searchSortableConfig.fieVal] =
      queryParam[props.searchSortableConfig.fieVal].slice(1)
  }
  return queryParam
})
// 树结构懒加载
const loadFunComputed = computed(() => {
  return props.loadFun ?? getChildrenList
})
/** 获取子菜单列表 */
const getChildrenList = async (
  row: ObjectType,
  treeNode: unknown,
  resolve: (data: ObjectType[]) => void
) => {
  console.log('获取子菜单列表')
  dataExpandMap.value[String(row[treeConfig.value.id])] = { row, treeNode, resolve }
  const children = dataChildrenListMap.value[String(row[treeConfig.value.id])] || []
  // 菜单的子菜单清空后关闭展开
  if (children.length == 0) {
    // fix: 处理当菜单只有一个子菜单并被删除，需要将父菜单的展开状态关闭
    tableRef.value?.updateKeyChildren(row[treeConfig.value.id], children)
  }
  resolve(children)
}
/** 刷新展开的菜单数据 */
const refreshLoadTree = (parentId: string | number) => {
  if (dataExpandMap.value[String(parentId)]) {
    const { row, treeNode, resolve } = dataExpandMap.value[String(parentId)]
    if (row) {
      loadFunComputed.value(row, treeNode, resolve)
      if (
        row[treeConfig.value.parentId] &&
        dataExpandMap.value[String(row[treeConfig.value.parentId])]
      ) {
        const grandpaMenu = dataExpandMap.value[String(row[treeConfig.value.parentId])]
        loadFunComputed.value(grandpaMenu.row, grandpaMenu.treeNode, grandpaMenu.resolve)
      }
    }
  }
}
/** 重新加载所有已展开的菜单的数据 */
const refreshAllExpandMenuData = () => {
  for (const dataId in dataExpandMap.value) {
    // console.log(dataId, 'refreshAllExpandMenuData', dataExpandMap.value);
    refreshLoadTree(String(dataId))
  }
}
const handleQuery = (queryParam = { ...queryParams.value }, isFirst: boolean = false) => {
  loading.value = true
  if (typeof queryParam == 'undefined') {
    queryParam = { ...queryParams.value }
  }
  queryParam = { ...queryParams.value, ...queryParam, ...sortPropDataComputed.value }
  if (isFirst) {
    queryParam.pageNum = 1
  }
  queryParams.value = { ...queryParam, ...sortPropDataComputed.value }
  clearSelection()
  // console.log(1);
  // queryParam = { ...queryParam, ...sortPropDataComputed.value };
  if (!props.dataListFun) {
    emits('query', queryParam)
  } else {
    props.dataListFun(
      queryParam,
      async (res: string | Promise<ObjectType> | Primitive[], ...obj: Primitive[]) => {
        let requestData: ObjectType = {
          [props.dataConfig.rows]: [],
          [props.dataConfig.total]: 0,
          [props.dataConfig.extra]: {},
        }
        try {
          if (res instanceof Promise) {
            requestData = await (res as Promise<ObjectType>)
          } else if (typeof res == 'string' && props.dataLoadFun) {
            const query = {
              url: res,
              method: obj[1] ?? 'GET',
              params: obj[0],
              data: obj[0],
            }
            if ((query.method as string).toLowerCase() === 'get') {
              delete query.data
            } else {
              delete query.params
            }

            try {
              requestData = await (props.dataLoadFun(query) as Promise<ObjectType>)
            } catch (err) {
              requestData = {
                [props.dataConfig.rows]: [],
                [props.dataConfig.total]: 0,
                [props.dataConfig.extra]: {},
              }
            }
            //console.log(res, query);
          } else {
            requestData = {
              [props.dataConfig.rows]: res,
              [props.dataConfig.total]: obj[0],
              [props.dataConfig.extra]: obj[1],
            }
          }
          // console.log(res)
          const datas = requestData[props.dataConfig.rows]
          const extras = requestData[props.dataConfig.extra]
          let treeDatas = []
          const isTree = props.isTree
          if (isTree) {
            originalData.value = datas
          }

          if (typeof isTree === 'boolean' && isTree) {
            treeConfig.value = {
              id: 'id',
              parentId: 'parentId',
              children: 'children',
              firstParentId: '0',
            }
          } else if (isTree as IsTreeConfig) {
            treeConfig.value = isTree as IsTreeConfig
          }
          if (treeConfig.value) {
            const tempMap: { [key: string]: Primitive } = {}
            // 存储 父菜单:子菜单列表
            for (const dataItem of datas) {
              const parentId = String(dataItem[treeConfig.value.parentId])
              if (!tempMap[parentId]) {
                tempMap[parentId] = []
              }
              tempMap[parentId].push(dataItem)
            }
            // 设置有没有子菜单
            for (const dataItem of datas) {
              dataItem[props.treeProps.hasChildren] =
                tempMap[dataItem[treeConfig.value.id]]?.length > 0
            }
            dataChildrenListMap.value = tempMap
            treeDatas = tempMap[treeConfig.value.firstParentId] || []
            if (proxyProps.value['onDataLoadCompleted']) emits('dataLoadCompleted', treeDatas, 0)
            dataListComputed.value = treeDatas
            totalComputed.value = 0
            refreshAllExpandMenuData()
            return
          }
          // console.log(datas);
          const total = props.hasPage ? requestData[props.dataConfig.total] : 0
          if (proxyProps.value['onDataLoadCompleted']) emits('dataLoadCompleted', datas, total)
          dataListComputed.value = datas
          totalComputed.value = total
          extra.value = extras
          nextTick(() => {
            rowHeightInner.value = Math.max(props.rowHeight, getHeight('.operation-column') + 20)
          })
        } finally {
          loading.value = false
        }
      }
    )
  }
  //setCurrentRow(undefined)
}
const handleAdd = () => {
  if (proxyPropsParamsInfo.value['onAdd']) {
    operationLoading.value = true
    emits('add', () => {
      operationLoading.value = false
    })
  } else {
    emits('add')
  }
}
const handleImport = () => {
  if (proxyPropsParamsInfo.value['onImport']) {
    operationLoading.value = true
    emits('import', () => {
      operationLoading.value = false
    })
  } else {
    emits('import')
  }
}
const operationData = computed(() => {
  return {
    ...queryParams.value,
    multipleSelection: multipleSelection.value,
  }
})
const downloadInnerFun = (url: string | URL, params = {}) => {
  request('GET', url, params, true).then((res) => {
    handleFileDownload(res)
  })
}
const downloadFun = computed(() => {
  return props.downFun ?? downloadInnerFun
})
const handleExport = () => {
  const data = {
    ...queryParams.value,
    multipleSelection: multipleSelection.value,
  }
  const cb = (
    url: string,
    params = {},
    fileName: string | undefined = undefined,
    methods: 'get' | 'post' = 'get'
  ) => {
    if (typeof url !== 'undefined') {
      downloadFun.value(url, params, fileName, methods).finally(() => {
        operationLoading.value = false
      })
    } else operationLoading.value = false
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
const handleUpdate = (row: ObjectType) => {
  if (proxyPropsParamsInfo.value['onUpdate']) {
    operationLoading.value = true
    emits('update', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('update', row)
  }
}
const operationLoading = ref(false)
const removeCallback = async (
  flag: string | boolean | Promise<ObjectType> = true,
  ...obj: Primitive[]
) => {
  if (flag instanceof Promise) {
    try {
      const res = await (flag as Promise<ObjectType>)
      flag = res[props.code] == props.status
    } catch (e) {
      flag = false
    }
  } else if (typeof flag == 'string' && props.dataLoadFun) {
    try {
      const query = {
        url: flag,
        method: obj[1] ?? 'POST',
        params: obj[0],
        data: obj[0],
      }
      if (query.method.toLowerCase() === 'get') {
        delete query.data
      } else {
        delete query.params
      }
      const res = await (props.dataLoadFun as Promise<ObjectType>)(query)
      flag = res[props.code] == props.status
    } catch (e) {
      flag = false
    }
  }
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
}
const handleRemove = (row: ObjectType) => {
  operationLoading.value = true
  ElMessageBox.confirm(props.removeMessage, props.removeType, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: props.removeMessageTitle,
    type: props.removeType,
  })
    .then(() => {
      emits(
        'remove',
        row,
        async (flag: string | boolean | Promise<ObjectType> = true, ...obj: any[]) => {
          await removeCallback(flag, ...obj)
        }
      )
    })
    .catch(() => {
      operationLoading.value = false
    })
}
const handleBatchRemove = () => {
  operationLoading.value = true
  ElMessageBox.confirm(props.removeMessage, props.removeType, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: props.removeMessageTitle,
    type: props.removeType,
  })
    .then(() => {
      emits(
        'batch-remove',
        multipleSelection.value,
        async (flag: string | boolean | Promise<ObjectType> = true, ...obj: Primitive[]) => {
          await removeCallback(flag, ...obj)
        }
      )
    })
    .catch(() => {
      operationLoading.value = false
    })
}
const handleDetail = (row: ObjectType) => {
  if (proxyPropsParamsInfo.value['onDetail']) {
    operationLoading.value = true
    emits('detail', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('detail', row)
  }
}
const handleAddSon = (row: ObjectType) => {
  // emits('add-son', row);
  if (proxyPropsParamsInfo.value['onAddSon']) {
    operationLoading.value = true
    emits('add-son', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('add-son', row)
  }
}
/**
 * 插槽按钮事件
 * @param cb 调用的接口
 * @param refresh 刷新模式
 */
const updateLoading = (cb: Promise<ObjectType>, refresh: 'now' | 'first' | '' = 'now') => {
  operationLoading.value = true
  cb.then((res) => {
    if (res[props.code] == props.status) {
      ElMessage({
        message: props.message,
        grouping: true,
        duration: props.duration,
        type: 'success',
        showClose: props.duration! > 0,
        onClose: () => {
          operationLoading.value = false
          if (refresh === 'now') {
            handleQuery()
          } else if (refresh === 'first') {
            handleQuery(undefined, true)
          }
        },
      })
    } else {
      operationLoading.value = false
    }
  }).catch(() => {
    operationLoading.value = false
  })
}
const handleNeedConfirmEvent = ({
  data,
  eventName,
  message,
  iconType = 'warning',
  confirmText = '确定',
  cancelText = '取消',
  title = '提示',
}: {
  data: ObjectType[] | ObjectType
  eventName: string
  message: string
  iconType: typeof props.removeType
  confirmText: string
  cancelText: string
  title: string
}) => {
  if (!message || !data || !eventName) {
    console.error('提示消息/数据/事件名称不能为空')
  }
  operationLoading.value = true
  ElMessageBox.confirm(message, iconType, {
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    title: title,
    type: iconType,
  })
    .then(() => {
      emits(
        'custom-event',
        {
          eventName,
          data,
        },
        async (flag: string | boolean | Promise<ObjectType> = true, ...obj: Primitive[]) => {
          await removeCallback(flag, ...obj)
        }
      )
    })
    .catch(() => {
      operationLoading.value = false
    })
}
defineExpose({
  multipleSelection: multipleSelection.value,
  toggleSelection,
  startQuery,
  query: handleQuery,
  handleNeedConfirmEvent,
  slots,
  originalData: originalData.value,
  updateLoading,
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

:deep(.el-table__cell) {
  padding: 16px 0;

  .span {
    line-height: 33px;
  }
}

:deep(.el-table) {
  transition: height 0.1s;
}

.extra {
  color: var(--el-text-color-regular);
  font-weight: normal;
  margin-left: var(--el-pagination-item-gap);
}

:deep(.el-table-v2__table) {
  .el-table-v2__header-wrapper {
    .el-table-v2__header {
      .el-table-v2__header-row {
        .el-table-v2__header-cell {
          color: var(--tableHeaderTextColor);
          background-color: var(--tableHeaderBg);
        }
      }
    }
  }
}
// :deep(.el-table-v2__left) {
//   .el-table-v2__body {
//     height: v-bind(--tableFixedHeightInner);
//     > div {
//       height: v-bind(--heightInner) !important;
//     }
//   }
// }
</style>
