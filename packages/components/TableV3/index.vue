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

      <vxe-grid
        ref="tableRef"
        v-bind="gridOptions"
        :height="heightAuto ? heightInner : height"
        :width="widthAuto ? widthInner : width"
        :data="dataListComputed"
        :loading="loading"
        :row-config="rowConfig"
        :tree-config="treeConfigComputed"
        :sort-config="sortConfig"
        :checkbox-config="checkboxConfigComputed"
        :empty-render="{ name: 'Empty', message: emptyText }"
        @sort-change="handleSortChange"
        @checkbox-change="handleCheckboxChange"
        @checkbox-all="handleCheckboxAll"
        @current-change="handleCurrentChange"
        @expand-change="handleExpandChange"
      >
        <template #empty>
          <slot name="empty">
            <div class="vxe-table-empty">{{ emptyText }}</div>
          </slot>
        </template>

        <template #loading>
          <slot name="overlay">
            <div class="vxe-loading-mask">
              <el-icon class="is-loading" color="var(--el-color-primary)" :size="26">
                <Loading />
              </el-icon>
            </div>
          </slot>
        </template>

        <template
          v-for="col in dynamicSlotColumns"
          :key="col.slotName"
          #[col.slotName]="{ row, rowIndex }"
        >
          <slot :name="col.prop" :row="row" :index="rowIndex" :column="col">
            <span :class="getCellClass(row, col, rowIndex)">
              {{ formatCellValue(row, col, rowIndex) }}
            </span>
          </slot>
        </template>

        <!-- 操作列插槽 - 使用 TableOperations 组件 -->
        <template #operation="{ row, rowIndex }">
          <TableOperations
            :scope="{ row, $index: rowIndex }"
            :slots="slots"
            :query-params="queryParams"
            :has-operation-text="hasOperationText"
            :has-operation-link="hasOperationLink"
            :has-operation-name="hasOperationName"
            :operation-loading="operationLoading"
            :has-add-son="hasAddSon"
            :has-add-son-type="hasAddSonType"
            :has-add-son-icon="hasAddSonIcon"
            :has-detail="hasDetail"
            :has-detail-type="hasDetailType"
            :has-detail-icon="hasDetailIcon"
            :has-update="hasUpdate"
            :has-update-type="hasUpdateType"
            :has-update-icon="hasUpdateIcon"
            :has-remove="hasRemove"
            :has-remove-type="hasRemoveType"
            :has-remove-icon="hasRemoveIcon"
            :more-button="moreButton"
            :more-button-type="moreButtonType"
            :more-button-trigger="moreButtonTrigger"
            :align="operationAlign"
            :simp-trans-var="simpTransVar"
            :proxy-props="proxyPropsForOperations"
            :get-slot-content="getSlotContentForOperation(row, rowIndex)"
            :get-slot-count="getSlotCountForOperation"
            @add-son="handleAddSon"
            @detail="handleDetail"
            @update="handleUpdate"
            @remove="handleRemove"
          />
        </template>
      </vxe-grid>

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

<script setup lang="ts" name="MyTableV3">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  watch,
  h,
  type VNode,
  type Component,
} from 'vue'
import { VxeGridInstance, VxeGridProps, VxeColumnPropTypes } from 'vxe-table'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import TableOperations, { type SlotContentItem } from '../components/TableOperations/index.vue'
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
  Loading,
} from '@element-plus/icons-vue'
import { ElCheckbox, ElIcon, ElMessage, ElMessageBox, ElTooltip, ElButton } from 'element-plus'
import {
  deepClone,
  getComputedStyle,
  getHeight,
  getRemainingHeight,
  getZoomPercent,
} from '../js/utils'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useListenDomChange } from '../utils/hooks'
import { handleFileDownload, request } from '../js'
import { Primitive, TableButtonType, ObjectType, FunctionType } from '../js/types'
import FunctionAnalyzer from '../utils/FunctionAnalyzer'

// ======================== 类型定义 ========================
interface IsTreeConfig {
  id: string
  parentId: string
  children: string
  firstParentId: string
}

export interface queryParamType {
  [key: string]: string | number | undefined | boolean
}

export interface query extends queryParamType {
  pageSize: number
  pageNum: number
}

export interface tableColumnItem {
  prop: string
  label: string
  isTable?: boolean
  isForm?: boolean
  showOverflow?: boolean
  width?: number
  minWidth?: number
  unit?: string | ((row: object, prop: string, other: object) => string)
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
  fun?: FunctionType
  funDom?: FunctionType
  type?: 'number' | 'string'
  classFun?: (row: ObjectType, prop: string, other?: { index?: number }) => string
  showFun?: (row?: queryParamType | Primitive, other?: { index?: number }) => boolean
  slot?: string
  header?:
    | string
    | ((row: ObjectType, prop: string, other?: { index?: number }) => string | VNode | Component)
  list?: tableColumnItem[]
}

export interface TableProps {
  hasPage: boolean
  moreButton: string
  moreButtonType?: string
  moreButtonTrigger?: 'hover' | 'click'
  simpTransVar: number
  hasTableTopPlain: boolean
  pageLayout: string
  pagerCount: number
  isTree?: boolean | IsTreeConfig
  lazy: boolean
  defaultExpandAll: boolean
  loadFun: (row: Primitive, treeNode: unknown, resolve: (data: Primitive[]) => void) => void
  treeProps: { children: string; hasChildren: string }
  language: object
  hasIndex: boolean | string
  hasSelection: boolean | ((row: ObjectType, index: number) => boolean)
  hasOperation: boolean | string
  operationWidth: number | undefined
  oneOperationWidth: number
  hasOperationName: boolean
  height: number | undefined
  width: number | undefined
  rowHeight: number | undefined
  baseClass: string
  autoHeightExcludeClassName: string[]
  align: 'center' | 'left' | 'right'
  operationAlign: 'center' | 'left' | 'right'
  operationFixed?: false | 'left' | 'right'
  hasIndexFixed?: false | 'left' | 'right'
  maxWidth: boolean
  hasAdd: TableButtonType
  hasAddIcon: object
  hasBatchRemove: TableButtonType
  hasBatchRemoveIcon: object
  hasBatchRemoveType: string
  hasImport: TableButtonType
  hasImportIcon: object
  hasExport: TableButtonType
  hasExportIcon: object
  hasOperationText: boolean
  hasOperationLink: boolean
  hasDetail: TableButtonType
  hasDetailIcon: object
  hasDetailType: string
  hasAddSon: TableButtonType
  hasAddSonIcon: object
  hasAddSonType: string
  hasUpdate: TableButtonType
  hasUpdateIcon: object
  hasUpdateType: string
  hasRemove: TableButtonType
  hasRemoveIcon: object
  hasRemoveType: string
  tableColumn: tableColumnItem[]
  queryParam?: queryParamType
  removeMessage: string
  removeType: 'warning' | 'info' | 'error' | 'success'
  removeMessageTitle: string
  exportMessage: string | boolean
  exportType: 'warning' | 'info' | 'error' | 'success'
  exportMessageTitle: string
  dataList: Array<ObjectType> | undefined
  dataListFun?: (
    query: Record<string, Primitive>,
    cb: (res: string | Promise<ObjectType> | Primitive[], ...obj: Primitive[]) => void,
  ) => void
  dataLoadFun?: FunctionType
  dataConfig: { rows: string; total: string; extra: string }
  total: number
  highlightCurrentRow: boolean
  currentRowKey: string | number
  rowClassName: string | ((data: { row: ObjectType; rowIndex: number }) => string)
  rowStyle: object | ((data: { row: ObjectType; rowIndex: number }) => object)
  cellClassName:
    | string
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => string)
  cellStyle:
    | object
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => object)
  headerRowClassName: string | ((data: { row: Primitive; rowIndex: number }) => string)
  headerRowStyle: object | ((data: { row: ObjectType; rowIndex: number }) => object)
  headerCellClassName:
    | string
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => string)
  headerCellStyle:
    | object
    | ((data: {
        row: ObjectType
        column: ObjectType
        rowIndex: number
        columnIndex: number
      }) => object)
  rowKey: string | ((row: ObjectType) => string)
  emptyText: string
  duration: number
  message: string
  defaultBlock: string
  status?: number | boolean | string
  code?: string
  downFun?: FunctionType
  sortable?: boolean
  sortableConfig?: { desc: string | number | boolean; asc: string | number | boolean }
  searchSortableConfig?: { fieId: string; fieVal: string }
}

// ======================== Props 定义 ========================
const props = withDefaults(defineProps<TableProps>(), {
  hasPage: true,
  moreButton: '更多',
  moreButtonType: 'primary',
  moreButtonTrigger: 'hover',
  simpTransVar: 3,
  hasTableTopPlain: true,
  isTree: false,
  downFun: () => '',
  status: 0,
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
  pagerCount: 5,
  pageLayout: 'total, sizes, prev, pager, next, jumper',
  oneOperationWidth: 70,
  hasOperationName: true,
  height: undefined,
  width: undefined,
  rowHeight: 50,
  baseClass: '.app-main',
  autoHeightExcludeClassName: () => [],
  maxWidth: true,
  sortable: true,
  sortableConfig: () => ({ asc: 'asc', desc: 'desc' }),
  searchSortableConfig: () => ({ fieVal: 'order', fieId: 'sidx' }),
  hasAdd: true,
  hasAddIcon: () => Plus,
  hasBatchRemove: true,
  hasBatchRemoveIcon: () => Delete,
  hasImport: true,
  hasImportIcon: () => Upload,
  hasExport: true,
  hasExportIcon: () => Download,
  hasOperationText: true,
  hasOperationLink: true,
  hasDetail: '详情',
  hasDetailIcon: () => View,
  hasDetailType: 'primary',
  hasAddSon: '新增',
  hasAddSonIcon: () => Plus,
  hasAddSonType: 'primary',
  hasUpdate: '修改',
  hasUpdateIcon: () => Edit,
  hasUpdateType: 'primary',
  hasRemove: '删除',
  hasRemoveIcon: () => Delete,
  hasRemoveType: 'danger',
  hasBatchRemoveType: 'danger',
  align: 'left',
  operationAlign: 'center',
  hasIndexFixed: 'left',
  operationFixed: 'right',
  tableColumn: () => [],
  queryParam: undefined,
  removeMessage: '您确定删除该数据吗? 警告:该操作不可逆,请慎重操作',
  removeType: 'warning',
  removeMessageTitle: '警告',
  exportMessage: '是否确认导出数据?',
  exportType: 'warning',
  exportMessageTitle: '提示',
  dataList: undefined,
  dataListFun: undefined,
  dataConfig: () => ({ rows: 'rows', total: 'total', extra: 'extra' }),
  total: 0,
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
  rowKey: 'id',
  emptyText: '没有数据',
  duration: 1500,
  message: '操作成功',
  defaultBlock: '-',
})

// ======================== 响应式数据 ========================
const slots = useSlots()
const tableRef = ref<VxeGridInstance>()
const heightInner = ref<number>(0)
const widthInner = ref<number>(0)
const rowHeightInner = ref<number>(props.rowHeight)
const totalInner = ref<number>(0)
const dataListInner = ref<ObjectType[]>([])
const extra = ref<Record<string, Primitive>>({})
const loading = ref<boolean>(false)
const operationLoading = ref<boolean>(false)
const showSearchInner = ref(true)
const multipleSelection = ref<ObjectType[]>([])
const sortState = ref<Record<string, 'asc' | 'desc' | undefined>>({})
const sortPropData = ref<Record<string, Primitive>>({})
const originalData = ref<Primitive[]>()
const dataChildrenListMap = ref<Record<string, Primitive[]>>({})
const dataExpandMap = ref<
  Record<string, { row: ObjectType; treeNode: unknown; resolve: FunctionType }>
>({})

// 计算属性
const dataListComputed = computed(() => props.dataList || dataListInner.value)
const totalComputed = computed(() => props.total || totalInner.value)
const showSearch = computed({
  get: () => showSearchInner.value,
  set: (value) => {
    showSearchInner.value = value
    if (proxyProps.value['onUpdate:showSearch']) emits('update:showSearch', showSearchInner.value)
  },
})

const rowKeyField = computed(() => {
  if (typeof props.rowKey === 'function') return ''
  return props.rowKey || 'id'
})

// 全选状态
const allSelected = computed(() => {
  const selectableCount = dataListComputed.value.filter((row, idx) => {
    if (typeof props.hasSelection === 'function') {
      return props.hasSelection(row, idx)
    }
    return true
  }).length
  return (
    dataListComputed.value.length > 0 &&
    multipleSelection.value.length === selectableCount &&
    selectableCount > 0
  )
})

// 半选状态
const indeterminate = computed(() => {
  return multipleSelection.value.length > 0 && !allSelected.value
})

// 代理事件检测
const proxyProps = ref<Record<string, boolean>>({
  onAdd: false,
  onUpdate: false,
  onDetail: false,
  onRemove: false,
  onAddSon: false,
  onDataLoadCompleted: false,
  'onUpdate:showSearch': false,
  onBatchRemove: false,
  onExport: false,
  onImport: false,
  onSelectionChange: false,
  onCurrentChange: false,
  onExpandChange: false,
})

const proxyPropsParamsInfo = ref<Record<string, boolean>>({
  onAdd: false,
  onUpdate: false,
  onDetail: false,
  onRemove: false,
  onAddSon: false,
  onDataLoadCompleted: false,
  'onUpdate:showSearch': false,
})

// 用于传递给 TableOperations 的 proxyProps
const proxyPropsForOperations = computed(() => ({
  onAddSon: proxyProps.value.onAddSon,
  onDetail: proxyProps.value.onDetail,
  onUpdate: proxyProps.value.onUpdate,
  onRemove: proxyProps.value.onRemove,
}))

// 树配置
const treeConfigRef = ref<IsTreeConfig | undefined>(undefined)

// 树形配置
const treeConfigComputed = computed(() => {
  if (!props.isTree) return undefined
  return {
    children: props.treeProps.children,
    hasChildren: props.treeProps.hasChildren,
    expandAll: props.defaultExpandAll,
    lazy: props.lazy,
    loadMethod: loadFunComputed.value,
  }
})

// 排序配置
const sortConfig = computed(() => ({
  multiple: true,
  showIcon: true,
  remote: true,
}))

// 复选框配置
const checkboxConfigComputed = computed(() => ({
  highlight: true,
  reserve: true,
  checkMethod: ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
    if (typeof props.hasSelection === 'function') {
      return props.hasSelection(row, rowIndex)
    }
    return !!props.hasSelection
  },
}))

// 行配置
const rowConfig = computed(() => ({
  keyField: rowKeyField.value,
  isHover: true,
  isCurrent: props.highlightCurrentRow,
  height: rowHeightInner.value,
}))

// 操作宽度计算
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
    if (i === 0) width = 70
    else if (i >= 1) width -= 80
  }
  return width
})

// 查询参数
const queryParams = ref<query>({ pageSize: 10, pageNum: 1, ...props.queryParam })

watch(
  () => props.queryParam,
  () => {
    queryParams.value = { ...queryParams.value, ...props.queryParam }
  },
  { deep: true, immediate: true },
)

// 动态列配置
const dynamicSlotColumns = computed(() => {
  return props.tableColumn.filter((col) => slots[col.prop])
})

// 获取操作列的插槽内容
const getSlotContentForOperation = (row: ObjectType, rowIndex: number): SlotContentItem[] => {
  const slotNames = [
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
  const result: SlotContentItem[] = []

  for (const slotName of slotNames) {
    const slot = slots[slotName]
    if (slot) {
      // 如果是内置按钮类型，直接添加标识
      if (
        slotName === 'addSon' ||
        slotName === 'detail' ||
        slotName === 'update' ||
        slotName === 'remove'
      ) {
        result.push(slotName)
      } else {
        // 其他插槽，调用并添加 VNode
        const vnodes = slot({
          data: row,
          index: rowIndex,
          text: props.hasOperationText,
          link: props.hasOperationLink,
          loading: operationLoading.value,
        })
        if (vnodes) {
          if (Array.isArray(vnodes)) {
            result.push(...vnodes)
          } else {
            result.push(vnodes)
          }
        }
      }
    } else if (slotName === 'addSon' && props.hasAddSon && proxyProps.value.onAddSon) {
      result.push('addSon')
    } else if (slotName === 'detail' && props.hasDetail && proxyProps.value.onDetail) {
      result.push('detail')
    } else if (slotName === 'update' && props.hasUpdate && proxyProps.value.onUpdate) {
      result.push('update')
    } else if (slotName === 'remove' && props.hasRemove && proxyProps.value.onRemove) {
      result.push('remove')
    }
  }

  return result
}

// 获取操作列需要显示的按钮数量（0 表示使用 simpTransVar 控制）
const getSlotCountForOperation = computed(() => 0)

// ======================== 辅助函数 ========================
const formatCellValue = (row: ObjectType, col: tableColumnItem, rowIndex: number): string => {
  const separator = [',', '~', '-', '/']
  const nowSeparator = separator.find((item) => col.prop.indexOf(item) > -1)
  const type = col.type || (typeof row[col.prop] === 'number' ? 'number' : 'string')

  let content: string
  if (nowSeparator) {
    const propArr = col.prop.split(nowSeparator)
    const fundatas: string[] = []
    propArr.forEach((item) => {
      const val =
        type === 'number' ? (row[item] ?? props.defaultBlock) : row[item] || props.defaultBlock
      fundatas.push(String(val))
    })
    content = fundatas.join(nowSeparator)
  } else {
    content = String(
      type === 'number'
        ? (row[col.prop] ?? props.defaultBlock)
        : row[col.prop] || props.defaultBlock,
    )
  }

  const unit =
    typeof col.unit === 'string' ? col.unit : (col.unit?.(row, col.prop, { index: rowIndex }) ?? '')
  return content !== props.defaultBlock ? content + unit : content
}

const getCellClass = (row: ObjectType, col: tableColumnItem, rowIndex: number): string => {
  if (col.classFun) {
    return col.classFun(row, col.prop, { index: rowIndex })
  }
  return `cell-${col.prop}`
}

// 递归处理子列的函数
const processChildrenColumns = (children: tableColumnItem[]): VxeColumnPropTypes[] => {
  const result: VxeColumnPropTypes[] = []

  for (const childCol of children) {
    if (childCol.isTable === false) continue

    const childColumn: VxeColumnPropTypes = {
      field: childCol.prop,
      title: childCol.label,
      width: childCol.width,
      minWidth:
        childCol.minWidth || (childCol.maxWidth !== false && props.maxWidth ? 120 : undefined),
      fixed: childCol.fixed === true ? 'left' : (childCol.fixed as 'left' | 'right' | undefined),
      align: childCol.align || props.align,
      showOverflow: childCol.showOverflow,
      sortable: childCol.sortable && props.sortable ? 'custom' : false,
      resizable: false,
    }

    // 自定义渲染
    if (slots[childCol.prop]) {
      childColumn.slots = {
        default: (scope: { row: ObjectType; rowIndex: number }) => {
          return slots[childCol.prop]!({ row: scope.row, index: scope.rowIndex, column: childCol })
        },
      }
    } else if (childCol.funDom) {
      childColumn.slots = {
        default: (scope: { row: ObjectType; rowIndex: number }) =>
          childCol.funDom!(scope.row, childCol.prop, { index: scope.rowIndex }),
      }
    } else if (childCol.fun) {
      childColumn.formatter = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        const result = childCol.fun!(row, childCol.prop, {
          index: rowIndex,
          renderTxt: (v: string) => v,
        })
        if (typeof result === 'object') return result
        return result || props.defaultBlock
      }
    } else {
      childColumn.formatter = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        return formatCellValue(row, childCol, rowIndex)
      }
    }

    // 自定义类名
    if (childCol.classFun) {
      childColumn.cellClassName = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        return childCol.classFun!(row, childCol.prop, { index: rowIndex })
      }
    }

    // 递归处理子列
    if (childCol.list && childCol.list.length > 0) {
      childColumn.children = processChildrenColumns(childCol.list)
    }

    result.push(childColumn)
  }

  return result
}

// 生成列配置
const generateColumns = (): VxeColumnPropTypes[] => {
  const columns: VxeColumnPropTypes[] = []

  // 选择列 - 带表头全选复选框，固定在左侧，禁止拖动宽度，不显示标题
  if (props.hasSelection) {
    columns.push({
      field: '__checkbox',
      type: 'checkbox',
      width: 50,
      fixed: 'left',
      align: 'center',
      resizable: false,
    })
  }

  // 序号列 - 固定在左侧，禁止拖动宽度
  if (props.hasIndex && !props.isTree) {
    columns.push({
      type: 'seq',
      title: '序号',
      width: 60,
      fixed: 'left',
      align: 'center',
      resizable: false,
    })
  }

  // 数据列 - 支持多级子列
  for (const col of props.tableColumn) {
    if (col.isTable === false) continue

    // 如果有子列（分组列）
    if (col.list && col.list.length > 0) {
      const groupColumn: VxeColumnPropTypes = {
        title: col.label,
        align: col.align || props.align,
        fixed: col.fixed === true ? 'left' : (col.fixed as 'left' | 'right' | undefined),
        resizable: false,
        showOverflow: col.showOverflow ?? true,
        children: processChildrenColumns(col.list),
      }

      // 设置列宽（如果指定了宽度）
      if (col.width) {
        groupColumn.width = col.width
      }

      columns.push(groupColumn)
      continue
    }

    // 普通列
    const column: VxeColumnPropTypes = {
      field: col.prop,
      title: col.label,
      width: col.width,
      minWidth: col.minWidth || (col.maxWidth !== false && props.maxWidth ? 120 : undefined),
      fixed: col.fixed === true ? 'left' : (col.fixed as 'left' | 'right' | undefined),
      align: col.align || props.align,
      showOverflow: col.showOverflow ?? true,
      sortable: col.sortable && props.sortable ? 'custom' : false,
      resizable: false,
      titleHelpRender: 'MyElTooltip',
      titleHelp: { message: '这是姓名说明', placement: 'top' },
    }

    // 自定义渲染
    if (slots[col.prop]) {
      column.slots = {
        default: (scope: { row: ObjectType; rowIndex: number }) => {
          return slots[col.prop]!({ row: scope.row, index: scope.rowIndex, column: col })
        },
      }
    } else if (col.funDom) {
      column.slots = {
        default: (scope: { row: ObjectType; rowIndex: number }) =>
          col.funDom!(scope.row, col.prop, { index: scope.rowIndex }),
      }
    } else if (col.fun) {
      column.formatter = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        const result = col.fun!(row, col.prop, { index: rowIndex, renderTxt: (v: string) => v })
        if (typeof result === 'object') return result
        return result || props.defaultBlock
      }
    } else {
      column.formatter = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        return formatCellValue(row, col, rowIndex)
      }
    }

    // 自定义类名
    if (col.classFun) {
      column.cellClassName = ({ row, rowIndex }: { row: ObjectType; rowIndex: number }) => {
        return col.classFun!(row, col.prop, { index: rowIndex })
      }
    }

    columns.push(column)
  }

  // 操作列 - 固定在右侧，禁止拖动宽度，使用 TableOperations 组件渲染
  const hasOperationValue =
    props.hasOperation &&
    ((props.hasAddSon && proxyProps.value.onAddSon) ||
      (props.hasDetail && proxyProps.value.onDetail) ||
      (props.hasUpdate && proxyProps.value.onUpdate) ||
      (props.hasRemove && proxyProps.value.onRemove) ||
      slots.operationBefore ||
      slots.operationAfter)

  if (hasOperationValue) {
    columns.push({
      field: 'operation',
      title: typeof props.hasOperation === 'boolean' ? '操作' : props.hasOperation,
      width: operationWidthComputed.value,
      fixed: 'right',
      align: props.operationAlign,
      resizable: false,
      slots: { default: 'operation' },
    })
  }

  return columns
}

// 树形懒加载
const loadFunComputed = computed(() => {
  return props.loadFun ?? getChildrenList
})

const getChildrenList = async (
  row: ObjectType,
  treeNode: unknown,
  resolve: (data: ObjectType[]) => void,
) => {
  if (treeConfigRef.value) {
    dataExpandMap.value[String(row[treeConfigRef.value.id])] = { row, treeNode, resolve }
  }
  const children = dataChildrenListMap.value[String(row[treeConfigRef.value?.id])] || []
  resolve(children)
}

// 高度自适应
let timer: NodeJS.Timeout | null = null
const needAutoHeight = ref(true)

const heightChange = () => {
  if (timer) clearTimeout(timer)
  const zoom = getZoomPercent()
  const url = window.location.href
  const width = window.innerWidth
  const height = window.innerHeight
  const key = `${zoom}${url}${width}${height}`
  const oldHeight = Number(localStorage.getItem(key) || 0)
  if (oldHeight && oldHeight > 0) {
    heightInner.value = oldHeight
    // 注释掉 return，让高度每次都重新计算
    // return
  }
  timer = setTimeout(() => autoHeight(key), 500)
}

const autoHeight = (key: string) => {
  if (!needAutoHeight.value) return
  nextTick(() => {
    if (props.baseClass && typeof props.height === 'undefined') {
      const tableHeaderHeight = getHeight('.el-card__header')
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
      localStorage.setItem(key, String(heightInner.value))
      dom.forEach((item) => listenDoc.listen(item))
      if (props.hasPage) listenDoc.listen('.pagination-container')
    }
  })
}

const listenDoc = useListenDomChange(() => heightChange())

watch(
  () => needAutoHeight.value,
  (newVal) => {
    if (newVal) window.addEventListener('resize', heightChange)
    else window.removeEventListener('resize', heightChange)
  },
  { immediate: true },
)

// ======================== 事件处理 ========================
const handleSortChange = ({
  property,
  order,
}: {
  property: string
  order: 'asc' | 'desc' | null
}) => {
  if (property) {
    sortState.value[property] = order || undefined
    if (order) {
      sortPropData.value[property] = props.sortableConfig?.[order]
    } else {
      delete sortPropData.value[property]
    }
  }
  handleQuery()
}

// 处理复选框变化（多选列）
const handleCheckboxChange = ({
  records,
  row,
  checked,
}: {
  records: ObjectType[]
  row: ObjectType
  checked: boolean
}) => {
  if (checked) {
    const idx = multipleSelection.value.findIndex((r) => JSON.stringify(r) === JSON.stringify(row))
    if (idx === -1) multipleSelection.value.push(row)
  } else {
    multipleSelection.value = multipleSelection.value.filter(
      (r) => JSON.stringify(r) !== JSON.stringify(row),
    )
  }

  if (proxyProps.value.onSelectionChange) {
    emits('selection-change', multipleSelection.value)
  }
}

const handleCheckboxAll = ({ records, checked }: { records: ObjectType[]; checked: boolean }) => {
  if (checked) {
    const selectableRows = dataListComputed.value.filter((row, idx) => {
      if (typeof props.hasSelection === 'function') {
        return props.hasSelection(row, idx)
      }
      return true
    })
    multipleSelection.value = [...selectableRows]
  } else {
    multipleSelection.value = []
  }

  if (proxyProps.value.onSelectionChange) {
    emits('selection-change', multipleSelection.value)
  }
}

const handleCurrentChange = ({ row }: { row: ObjectType }) => {
  if (proxyProps.value.onCurrentChange) emits('current-change', row)
}

const handleExpandChange = ({ row, expanded }: { row: ObjectType; expanded: boolean }) => {
  if (proxyProps.value.onExpandChange) emits('expand-change', row, expanded)
}

const handleQuery = (queryParam: Record<string, Primitive> = {}, isFirst: boolean = false) => {
  loading.value = true
  const finalParams = { ...queryParams.value, ...queryParam, ...sortPropData.value }
  if (isFirst) finalParams.pageNum = 1
  queryParams.value = finalParams as query

  if (!props.dataListFun) {
    emits('query', queryParams.value)
  } else {
    props.dataListFun(queryParams.value, async (res, ...obj) => {
      let requestData: ObjectType = {
        [props.dataConfig.rows]: [],
        [props.dataConfig.total]: 0,
        [props.dataConfig.extra]: {},
      }
      try {
        if (res instanceof Promise) {
          requestData = await res
        } else if (typeof res === 'string' && props.dataLoadFun) {
          const query = {
            url: res,
            method: obj[1] ?? 'GET',
            params: obj[0],
            data: obj[0],
          }
          if ((query.method as string).toLowerCase() === 'get') delete query.data
          else delete query.params
          requestData = await props.dataLoadFun(query)
        } else {
          requestData = {
            [props.dataConfig.rows]: res,
            [props.dataConfig.total]: obj[0],
            [props.dataConfig.extra]: obj[1],
          }
        }

        const datas = requestData[props.dataConfig.rows]
        const extras = requestData[props.dataConfig.extra]

        // 树形数据处理
        if (props.isTree) {
          originalData.value = datas
          if (typeof props.isTree === 'boolean') {
            treeConfigRef.value = {
              id: 'id',
              parentId: 'parentId',
              children: 'children',
              firstParentId: '0',
            }
          } else {
            treeConfigRef.value = props.isTree as IsTreeConfig
          }

          if (treeConfigRef.value) {
            const tempMap: Record<string, Primitive[]> = {}
            for (const item of datas) {
              const parentId = String(item[treeConfigRef.value.parentId])
              if (!tempMap[parentId]) tempMap[parentId] = []
              tempMap[parentId].push(item)
            }
            for (const item of datas) {
              item[props.treeProps.hasChildren] = tempMap[item[treeConfigRef.value.id]]?.length > 0
            }
            dataChildrenListMap.value = tempMap
            const treeDatas = tempMap[treeConfigRef.value.firstParentId] || []
            if (proxyProps.value.onDataLoadCompleted) emits('dataLoadCompleted', treeDatas, 0)
            dataListInner.value = treeDatas
            totalInner.value = 0
            loading.value = false
            return
          }
        }

        const total = props.hasPage ? requestData[props.dataConfig.total] : 0
        if (proxyProps.value.onDataLoadCompleted) emits('dataLoadCompleted', datas, total)
        dataListInner.value = datas
        totalInner.value = total
        extra.value = extras
      } finally {
        loading.value = false
      }
    })
  }
}

// ======================== 按钮事件处理 ========================
const handleAdd = () => {
  if (proxyPropsParamsInfo.value.onAdd) {
    operationLoading.value = true
    emits('add', () => {
      operationLoading.value = false
    })
  } else {
    emits('add')
  }
}

const handleImport = () => {
  if (proxyPropsParamsInfo.value.onImport) {
    operationLoading.value = true
    emits('import', () => {
      operationLoading.value = false
    })
  } else {
    emits('import')
  }
}

const handleExport = () => {
  const data = { ...queryParams.value, multipleSelection: multipleSelection.value }
  const cb = (url?: string, params = {}, fileName?: string, methods: 'get' | 'post' = 'get') => {
    if (url)
      downloadFun.value(url, params, fileName, methods).finally(() => {
        operationLoading.value = false
      })
    else operationLoading.value = false
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
  if (proxyPropsParamsInfo.value.onUpdate) {
    operationLoading.value = true
    emits('update', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('update', row)
  }
}

const removeCallback = async (
  flag: string | boolean | Promise<ObjectType> = true,
  ...obj: Primitive[]
) => {
  if (flag instanceof Promise) {
    try {
      const res = await flag
      flag = res[props.code!] == props.status
    } catch {
      flag = false
    }
  } else if (typeof flag === 'string' && props.dataLoadFun) {
    try {
      const query = {
        url: flag,
        method: obj[1] ?? 'POST',
        params: obj[0],
        data: obj[0],
      }
      if ((query.method as string).toLowerCase() === 'get') delete query.data
      else delete query.params
      const res = await props.dataLoadFun(query)
      flag = res[props.code!] == props.status
    } catch {
      flag = false
    }
  }
  if (flag) {
    ElMessage({
      message: props.message,
      grouping: true,
      duration: props.duration,
      type: 'success',
      showClose: props.duration > 0,
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
      emits('remove', row, async (flag = true, ...obj) => {
        await removeCallback(flag, ...obj)
      })
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
      emits('batch-remove', multipleSelection.value, async (flag = true, ...obj) => {
        await removeCallback(flag, ...obj)
      })
    })
    .catch(() => {
      operationLoading.value = false
    })
}

const handleDetail = (row: ObjectType) => {
  if (proxyPropsParamsInfo.value.onDetail) {
    operationLoading.value = true
    emits('detail', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('detail', row)
  }
}

const handleAddSon = (row: ObjectType) => {
  if (proxyPropsParamsInfo.value.onAddSon) {
    operationLoading.value = true
    emits('add-son', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('add-son', row)
  }
}

const downloadInnerFun = (url: string | URL, params = {}) => {
  request('GET', url, params, true).then((res) => handleFileDownload(res))
}

const downloadFun = computed(() => props.downFun ?? downloadInnerFun)

const updateLoading = (cb: Promise<ObjectType>, refresh: 'now' | 'first' | '' = 'now') => {
  operationLoading.value = true
  cb.then((res) => {
    if (res[props.code!] == props.status) {
      ElMessage({
        message: props.message,
        grouping: true,
        duration: props.duration,
        type: 'success',
        showClose: props.duration > 0,
        onClose: () => {
          operationLoading.value = false
          if (refresh === 'now') handleQuery()
          else if (refresh === 'first') handleQuery(undefined, true)
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
      emits('custom-event', { eventName, data }, async (flag = true, ...obj) => {
        await removeCallback(flag, ...obj)
      })
    })
    .catch(() => {
      operationLoading.value = false
    })
}

const toggleSelection = (rows?: ObjectType[]) => {
  if (rows && rows.length > 0) {
    rows.forEach((row) => {
      tableRef.value?.setCheckboxRow(row, true)
      const idx = multipleSelection.value.findIndex(
        (r) => JSON.stringify(r) === JSON.stringify(row),
      )
      if (idx === -1) multipleSelection.value.push(row)
    })
  } else {
    tableRef.value?.clearCheckboxRow()
    multipleSelection.value = []
  }
}

const clearSelection = () => {
  tableRef.value?.clearCheckboxRow()
  multipleSelection.value = []
}

const setCurrentRow = (row: ObjectType | null) => {
  if (row) {
    tableRef.value?.setCurrentRow(row)
  } else {
    tableRef.value?.clearCurrentRow()
  }
}

const getCurrentRow = () => {
  return tableRef.value?.getCurrentRow()
}

const toggleRowExpansion = (row: ObjectType, expanded?: boolean) => {
  if (expanded !== undefined) {
    if (expanded) {
      tableRef.value?.setExpandRow(row, true)
    } else {
      tableRef.value?.setExpandRow(row, false)
    }
  } else {
    tableRef.value?.toggleExpandRow(row)
  }
}

const expandAllRows = () => {
  tableRef.value?.setAllExpand(true)
}

const collapseAllRows = () => {
  tableRef.value?.setAllExpand(false)
}

const clearSort = () => {
  tableRef.value?.clearSort()
  sortState.value = {}
  sortPropData.value = {}
}

const setSort = (prop: string, order: 'asc' | 'desc' | null) => {
  tableRef.value?.setSort({ field: prop, order: order || '' })
}

const refreshLoadTree = (parentId: string | number) => {
  if (dataExpandMap.value[String(parentId)]) {
    const { row, treeNode, resolve } = dataExpandMap.value[String(parentId)]
    if (row) loadFunComputed.value(row, treeNode, resolve)
  }
}

const refreshAllExpandMenuData = () => {
  for (const dataId in dataExpandMap.value) {
    const { row, treeNode, resolve } = dataExpandMap.value[dataId]
    if (row) loadFunComputed.value(row, treeNode, resolve)
  }
}

// 需要隐藏的表格列
const canHiddenColumns = computed({
  get() {
    return deepClone(props.tableColumn)
      .filter((item) => item.isTable !== false)
      .map((item, index) => ({
        key: item.prop,
        label: item.label,
        visible: item.visible ?? true,
        hidden: item.hidden,
        index: index,
        maxWidth: item.width ? false : (item.maxWidth ?? props.maxWidth),
      }))
      .filter((item) => !item.hidden)
  },
  set(data) {
    data.forEach((item: { index: number; visible: boolean | undefined }) => {
      if (props.tableColumn[item.index]) {
        props.tableColumn[item.index].visible = item.visible
      }
    })
  },
})

const operationData = computed(() => ({
  ...queryParams.value,
  multipleSelection: multipleSelection.value,
}))

// 网格配置
const gridOptions = computed<VxeGridProps>(() => ({
  columns: generateColumns(),
  showOverflow: 'renderer',
  // toolt MyElTooltip
  tooltipConfig: {
    defaultPlacement: 'top',
    maxWidth: 300,
  },
}))

const heightAuto = computed(() => typeof props.height === 'undefined')
const widthAuto = computed(() => typeof props.width === 'undefined')

// ======================== Emit 定义 ========================
interface MyTableEmits {
  (eventName: 'query', params: query): void
  (eventName: 'add', callback?: (flag?: boolean) => void): void
  (eventName: 'update', row: ObjectType, callback?: (flag?: boolean) => void): void
  (eventName: 'detail', row: ObjectType, callback?: (flag?: boolean) => void): void
  (
    eventName: 'remove',
    row: ObjectType,
    callback?: (flag?: string | boolean | Promise<ObjectType>, ...obj: Primitive[]) => void,
  ): void
  (eventName: 'update:showSearch', visible: boolean): void
  (
    eventName: 'batch-remove',
    selectedRows: ObjectType[],
    callback?: (flag?: string | boolean | Promise<ObjectType>, ...obj: Primitive[]) => void,
  ): void
  (eventName: 'import', callback?: (flag?: boolean) => void): void
  (
    eventName: 'export',
    exportData: { [key: string]: Primitive; multipleSelection: ObjectType[] },
    callback?: (url?: string, params?: object, fileName?: string, methods?: string) => void,
  ): void
  (eventName: 'dataLoadCompleted', datas: ObjectType[], total: number): void
  (eventName: 'expand-change', row: ObjectType, expanded: boolean | ObjectType[]): void
  (eventName: 'add-son', parentRow: ObjectType, callback?: (flag?: boolean) => void): void
  (eventName: 'current-change', val: ObjectType): void
  (
    eventName: 'custom-event',
    row: { eventName: string; data: ObjectType },
    callback?: (flag?: string | boolean | Promise<ObjectType>, ...obj: Primitive[]) => void,
  ): void
  (eventName: 'selection-change', selection: ObjectType[]): void
}

const emits = defineEmits<MyTableEmits>()

// ======================== 生命周期 ========================
onMounted(() => {
  needAutoHeight.value = true
  const internal = getCurrentInstance()
  const onEmit = (internal?.vnode.props || {}) as Record<string, Primitive>
  for (const emit in onEmit) {
    proxyProps.value[emit] = typeof onEmit[emit] === 'function'
    if (proxyProps.value[emit]) {
      const funInfo = FunctionAnalyzer.analyzeParameters(onEmit[emit])
      if (
        funInfo.parameterCount > 0 &&
        funInfo.parameters.find(
          (item: { name: string }) => item.name === 'cb' || item.name === 'callback',
        )
      ) {
        proxyPropsParamsInfo.value[emit] = true
      }
    }
  }
  heightChange()
})

onUnmounted(() => {
  needAutoHeight.value = false
})

onDeactivated(() => {
  needAutoHeight.value = false
})

onActivated(() => {
  needAutoHeight.value = true
})

watch(
  () => props.dataList,
  () => {
    loading.value = false
  },
  { deep: true, immediate: true },
)

// ======================== 暴露方法 ========================
defineExpose({
  multipleSelection: multipleSelection.value,
  toggleSelection,
  clearSelection,
  setCurrentRow,
  getCurrentRow,
  toggleRowExpansion,
  expandAllRows,
  collapseAllRows,
  clearSort,
  setSort,
  startQuery: () => {
    loading.value = true
  },
  query: handleQuery,
  refreshLoadTree,
  refreshAllExpandMenuData,
  handleNeedConfirmEvent,
  updateLoading,
})
</script>

<style scoped lang="scss">
.table-plus {
  :deep(.vxe-checkbox) {
    .vxe-checkbox--icon {
      font-size: 14px;
    }
  }

  // 隐藏列宽拖动的手柄
  :deep(.vxe-resize) {
    display: none !important;
  }

  // 隐藏列宽拖动的区域
  :deep(.vxe-table--header .vxe-resize) {
    display: none !important;
  }

  // 禁止鼠标在列边界显示拖动图标
  :deep(.vxe-header--column) {
    user-select: none;
  }

  // Element Plus 风格的细滚动条
  :deep(.vxe-table--body-wrapper) {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--el-scrollbar-track-bg, #f5f5f5);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-scrollbar-thumb-bg, #c0c4cc);
      border-radius: 3px;
      transition: background 0.3s;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--el-scrollbar-thumb-hover-bg, #a8abb2);
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }

  .extra {
    color: var(--el-text-color-regular);
    font-weight: normal;
    margin-left: var(--el-pagination-item-gap);
  }

  .vxe-table-empty {
    text-align: center;
    padding: 20px;
    color: var(--el-text-color-secondary);
  }

  .vxe-loading-mask {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  }
}

:deep(.vxe-table) {
  .vxe-body--column {
    &.ellipsis-column {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .vxe-sort-icon {
    cursor: pointer;
  }
}
</style>
