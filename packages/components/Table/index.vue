<template>
  <el-config-provider :locale="language">
    <el-card shadow="hover" class="table-plus table-plus-card">
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
                :type="hasBatchRemoveType"
                :plain="hasTableTopPlain"
                :disabled="multipleSelection.length == 0"
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
                :loading="operationLoading"
                :plain="hasTableTopPlain"
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
      <el-table
        v-virtual="virtualScrollConfig"
        class="table-plus-main"
        :height="height || heightInner || maxHeight"
        :max-height="maxHeight || maxHeightInner || height"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :tree-props="treeProps"
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
        :lazy="lazy"
        :load="loadFunComputed"
        :default-expand-all="defaultExpandAll"
        @expand-change="tableRowStatusChange"
        @sort-change="onSort"
        @current-change="handleCurrentChange"
      >
        <el-table-column
          v-if="hasSelectionComputed"
          type="selection"
          fixed="left"
          :reserve-selection="reserve"
          :selectable="typeof hasSelection === 'boolean' ? () => true : hasSelection"
          width="55"
        />
        <el-table-column
          :fixed="hasIndexFixed"
          v-if="hasIndexComputed"
          :min-width="60"
          :label="typeof hasIndex === 'boolean' ? '序号' : hasIndex"
        >
          <template #default="scope">
            {{
              queryParams.pageSize * (queryParams.pageNum - 1) +
              (getRealIndex(scope && scope.$index) || 0)
            }}
          </template>
        </el-table-column>
        <MyTableColumn
          :defaultBlock="defaultBlock"
          :data="dataListComputed"
          :tableColumnFinal="tableColumnFinal"
          :align="align"
          v-bind="$attrs"
        ></MyTableColumn>

        <el-table-column
          :fixed="operationFixed"
          :align="operationAlign"
          :width="operationWidthComputed"
          v-if="hasOperationComputed"
        >
          <template #header>
            <slot name="operationHeader">
              {{ typeof hasOperation === 'boolean' ? '操作' : hasOperation }}
            </slot>
          </template>
          <template #default="scope">
            <TableOperations
              :align="operationAlign"
              :scope="scope"
              :slots="slots"
              :query-params="queryParams"
              :has-operation-text="hasOperationText"
              :has-operation-link="hasOperationLink"
              :has-add-son="hasAddSon"
              :has-detail="hasDetail"
              :has-update="hasUpdate"
              :has-remove="hasRemove"
              :has-add-son-icon="hasAddSonIcon"
              :has-detail-icon="hasDetailIcon"
              :has-update-icon="hasUpdateIcon"
              :has-remove-icon="hasRemoveIcon"
              :has-add-son-type="hasAddSonType"
              :has-detail-type="hasDetailType"
              :has-update-type="hasUpdateType"
              :has-remove-type="hasRemoveType"
              :proxy-props="proxyProps"
              :moreButton="moreButton"
              :moreButtonType="moreButtonType"
              :moreButtonTrigger="moreButtonTrigger"
              :hasOperationName="!hasOperationName"
              :operationLoading="operationLoading"
              :get-slot-content="
                getSlotContent({
                  data: scope.row,
                  index: queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1,
                  text: hasOperationText,
                  link: hasOperationLink,
                  loading: operationLoading,
                }).filter((item1) => item1)
              "
              :simpTransVar="simpTransVar"
              @add-son="handleAddSon"
              @detail="handleDetail"
              @update="handleUpdate"
              @remove="handleRemove"
            >
            </TableOperations>
          </template>
        </el-table-column>
        <template #empty v-if="slots['empty']">
          <slot name="empty"></slot>
        </template>
      </el-table>
      <pagination
        v-if="hasPage && !isTree"
        class="table-plus-pagination"
        v-show="totalComputed > 0"
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
    </el-card>
  </el-config-provider>
</template>

<script setup lang="ts" name="MyTable">
import vVirtual from '../../directive/virtualTable'
import {
  type Component,
  computed,
  type CSSProperties,
  getCurrentInstance,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  type VNode,
  watch,
} from 'vue'
import pagination from '../components/Pagination/index.vue'
import RightToolbar from '../components/RightToolbar/index.vue'
import MyTableColumn from '../components/tableColumn'
import TableOperations, { ButtonType, dataItemType } from '../components/TableOperations/index.vue'
import { Delete, Download, Edit, Plus, Upload, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, TableColumnCtx, TableInstance } from 'element-plus'
import FunctionAnalyzer from '../utils/FunctionAnalyzer'
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
import { ObjectType } from '../js/types'
import { scrollParams, virtualConfig } from '@/directive/types'

interface IsTreeConfig {
  id: string
  parentId: string
  children: string
  firstParentId: string
}
const slotContentCache = new Map()
// 获取 slot 的虚拟节点内容
function getSlotContent(
  scope_data: {
    data: { [key: string]: string | number | boolean }
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

// 定义 Props 类型（提取为独立接口，增强可读性和复用性）
export interface TableProps {
  /** 是否显示分页 */
  hasPage: boolean

  /** 表格顶部按钮Plain */
  hasTableTopPlain: boolean
  moreButton: string
  moreButtonType?: ButtonType
  moreButtonTrigger?: 'hover' | 'click'
  /** 分页配置 **/
  pageLayout: string
  pagerCount: number
  simpTransVar: number
  /**是树结构*/
  isTree?: boolean | IsTreeConfig
  /** 是否懒加载（树形结构） */
  lazy: boolean
  /** 树形结构是否默认展开所有节点 */
  defaultExpandAll: boolean
  /** 懒加载数据加载函数 */
  loadFun: (row: any, treeNode: unknown, resolve: (data: any[]) => void) => void
  /** 树形结构配置（子节点字段、是否有子节点字段） */
  treeProps: { children: string; hasChildren: string }
  /** 语言配置 */
  language: object
  /** 是否显示序号列（布尔值或自定义列名） */
  hasIndex: boolean | string
  /** 是否显示选择列（支持函数动态控制） */
  hasSelection: boolean | ((row: any, index: number) => boolean)
  /** 跨页多选 */
  reserve: boolean
  /** 是否显示操作列（布尔值或自定义列名） */
  hasOperation: boolean | string
  /** 操作列总宽度 */
  operationWidth: number | undefined
  /** 单个操作按钮宽度 */
  oneOperationWidth: number
  /** 是否显示操作列标题 */
  hasOperationName: boolean
  /** 表格最大高度 */
  maxHeight: number | string | undefined
  /** 表格固定高度 */
  height: number | string | undefined
  /** 基础样式类（用于计算高度等） */
  baseClass: string
  autoHeightExcludeClassName: string[]
  //默认对齐
  align: 'center' | 'left' | 'right'
  operationAlign: 'center' | 'left' | 'right'
  operationFixed?: false | 'left' | 'right'
  hasIndexFixed?: false | 'left' | 'right'
  /** 是否启用最大宽度限制 */
  maxWidth: boolean
  /** 是否显示【新增】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasAdd: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【新增】按钮图标配置 */
  hasAddIcon: object
  /** 是否显示【批量删除】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasBatchRemove: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【批量删除】按钮图标配置 */
  hasBatchRemoveIcon: object
  /** 【批量删除】按钮类型 */
  hasBatchRemoveType: ButtonType
  /** 是否显示【导入】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasImport: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【导入】按钮图标配置 */
  hasImportIcon: object
  /** 是否显示【导出】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasExport: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【导出】按钮图标配置 */
  hasExportIcon: object
  /** 操作按钮是否显示文本 */
  hasOperationText: boolean
  /** 操作按钮是否显示链接样式 */
  hasOperationLink: boolean
  /** 是否显示【详情】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasDetail: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【详情】按钮图标配置 */
  hasDetailIcon: object
  /** 【详情】按钮类型（对应 UI 库按钮类型） */
  hasDetailType: ButtonType
  /** 是否显示【新增子节点】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasAddSon: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【新增子节点】按钮图标配置 */
  hasAddSonIcon: object
  /** 【新增子节点】按钮类型（对应 UI 库按钮类型） */
  hasAddSonType: ButtonType
  /** 是否显示【修改】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasUpdate: boolean | string | ((data: dataItemType) => boolean | string)
  /** 【修改】按钮图标配置 */
  hasUpdateIcon: object
  /** 【修改】按钮类型（对应 UI 库按钮类型） */
  hasUpdateType: ButtonType
  /** 是否显示【删除】按钮（支持布尔值、自定义文本、函数动态控制） */
  hasRemove: boolean | string | ((data: dataItemType) => boolean | string)
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
  dataList: Array<dataItemType> | undefined
  /** 数据源加载函数 */
  dataListFun?: (
    query: { [key: string]: any },
    cb: (res: string | Promise<any> | any[], ...obj: any[]) => void
  ) => void
  dataLoadFun?: Function
  /** 数据源格式配置（数据列表字段、总数字段） */
  dataConfig: { rows: string; total: string; extra: string }
  /** 数据总数（用于分页） */
  total: number
  /** 是否高亮当前行 */
  highlightCurrentRow: boolean
  /** 当前行 Key（用于高亮/选中） */
  currentRowKey: string | number
  /** 行 className 配置（支持固定字符串或回调函数） */
  rowClassName: string | ((data: { row: any; rowIndex: number }) => string)
  /** 行样式配置（支持固定对象或回调函数） */
  rowStyle: CSSProperties | ((data: { row: any; rowIndex: number }) => CSSProperties)
  /** 单元格 className 配置（支持固定字符串或回调函数） */
  cellClassName:
    | string
    | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => string)
  /** 单元格样式配置（支持固定对象或回调函数） */
  cellStyle:
    | CSSProperties
    | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => CSSProperties)
  /** 表头行 className 配置（支持固定字符串或回调函数） */
  headerRowClassName: string | ((data: { row: any; rowIndex: number }) => string)
  /** 表头行样式配置（支持固定对象或回调函数） */
  headerRowStyle: CSSProperties | ((data: { row: any; rowIndex: number }) => CSSProperties)
  /** 表头单元格 className 配置（支持固定字符串或回调函数） */
  headerCellClassName:
    | string
    | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => string)
  /** 表头单元格样式配置（支持固定对象或回调函数） */
  headerCellStyle:
    | CSSProperties
    | ((data: { row: any; column: any; rowIndex: number; columnIndex: number }) => CSSProperties)
  /** 行 Key 配置（用于优化渲染和树形/选择功能） */
  rowKey: string | ((row: any) => string)
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
  downFun?: Function
  /** 默认排序方式 本地/远程*/
  sortable?: boolean
  sortableConfig?: { descending: string | number | boolean; ascending: string | number | boolean }
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
  span?: number
  rowspan?: number
  desColumn?: number
  unit?:
    | string
    | ((
        row: dataItemType,
        prop: string,
        other?: {
          index?: number
          tableColumnFinal?: tableColumnItem[]
          [key: string]: any
        }
      ) => string) //单位
  sortFun?: Function
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
  fun?: (
    row: dataItemType,
    prop: string,
    other?: {
      index?: number
      tableColumnFinal?: tableColumnItem[]
      searchValue?: { [key: string]: any }
      [key: string]: any
    }
  ) => string
  funDom?: (
    row: dataItemType,
    prop: string,
    other?: {
      index?: number
      tableColumnFinal?: tableColumnItem[]
      searchValue?: { [key: string]: any }
      [key: string]: any
    }
  ) => VNode | Component
  type?: 'number' | 'string'
  classFun?: (
    row: dataItemType,
    prop: string,
    other?: {
      index?: number
      tableColumnFinal?: tableColumnItem[]
      searchValue?: { [key: string]: any }
      [key: string]: any
    }
  ) => string
  showFun?: (
    row?: queryParamType | any,
    other?: {
      index?: number
      tableColumnFinal?: tableColumnItem[]
      searchValue?: { [key: string]: any }
      [key: string]: any
    }
  ) => boolean
  slot?: string
  // render?: any
  header?:
    | string
    | ((
        column: tableColumnItem,
        other?: {
          [key: string]: any
        }
      ) => string | VNode | Component)

  list?: tableColumnItem[]
}

const slots = useSlots()
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
  isTree: false,
  downFun: undefined,
  //删除成功的状态码
  status: 200,
  //删除成功的状态码字段
  code: 'code',
  lazy: true,
  defaultExpandAll: false,
  loadFun: undefined,
  treeProps: () => ({ children: 'children', hasChildren: 'hasChildren' }),
  language: () => zhCn,
  hasIndex: true,
  hasSelection: false,
  reserve: false,
  hasOperation: true,
  operationWidth: undefined,
  pagerCount: undefined,
  simpTransVar: 0,
  pageLayout: undefined,
  oneOperationWidth: 70,
  hasOperationName: true,
  maxHeight: undefined,
  height: undefined,
  baseClass: undefined,
  autoHeightExcludeClassName: () => [],
  maxWidth: true,
  sortable: true,
  sortableConfig: () => ({ descending: 'descending', ascending: 'ascending' }),
  searchSortableConfig: () => ({ fieId: 'fieId', fieVal: 'fieVal' }),
  // 顶部操作按钮（新增/批量删除/导入/导出）
  hasAdd: true,
  hasAddIcon: () => Plus,
  hasBatchRemove: true,
  hasBatchRemoveIcon: () => Delete,
  hasImport: true,
  hasImportIcon: () => Upload,
  hasExport: true,
  hasExportIcon: () => Download,
  hasTableTopPlain: true,
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
  hasUpdateType: () => 'warning',

  // 行内操作按钮（删除）
  hasRemove: '删除',
  hasRemoveIcon: () => Delete,
  hasRemoveType: () => 'danger',
  hasBatchRemoveType: () => 'danger',
  align: 'center',
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
  dataLoadFun: undefined,
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
const rowKeyComputed=computed(()=>{
  return props.rowKey
})
//表格实例
const tableRef = ref<TableInstance>()
const heightInner = ref(0)
const maxHeightInner = ref(0)

const totalInner = ref<number>(0)
const dataListInner = ref<dataItemType[]>([])
const totalComputed = computed({
  get: () => {
    return props.total || totalInner.value
  },
  set: (val: number) => {
    totalInner.value = val
  },
})
const startIndex = ref(0) // 当前渲染的起始索引
// 获取真实索引
const getRealIndex = (visibleIndex: number) => {
  return startIndex.value + visibleIndex + 1
}
const virtualScrollConfig = ref<virtualConfig>({
  isVirtual: true, // 启用虚拟滚动
  count: 20, // 可视区域显示20行（固定值）
  bufferSize: 10, // 缓冲区5行
  rowHeight: 40, // 默认行高40px
  onScroll: (info: scrollParams) => {
    startIndex.value = info.startIndex
  },
  isDebug:true
})
const extra = ref()
const dataListComputed = computed({
  get: () => {
    const val = props.dataList || dataListInner.value
    //@ts-ignore
    props.dataList&&props.dataList.length>0&&tableRef.value?._virtualScrollUpdateData?.(val)
    return val
  },
  set: (val) => {
    //@ts-ignore
    tableRef.value?._virtualScrollUpdateData?.(val)
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
  const onEmit = (internal?.vnode.props || {}) as Record<string, any>
  for (const emit in onEmit) {
    proxyProps.value[emit] = typeof onEmit[emit] === 'function'
    if (proxyProps.value[emit]) {
      const funInfo = FunctionAnalyzer.analyzeParameters(onEmit[emit])
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

  // 事件处理器会被归一化为 onXxx
  // hasUpdateListener.value = typeof props.onUpdate === 'function'
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
    // console.log('使用上次计算结果', heightInner.value)
    // return;
  }
  timer = setTimeout(() => autoHeight(key), 500)
}
const operationWidthComputed = computed(() => {
  let width = props.operationWidth ?? 100
  if (props.simpTransVar > 0) {
    return props.operationWidth || props.oneOperationWidth * (props.simpTransVar + 1) + 20
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
const baseClass = ref(props.baseClass)
// 热更新相关
if (import.meta.hot) {
  // 保存状态
  // import.meta.hot.data = import.meta.hot.data || {};
  //123
  // // 恢复状态
  if (import.meta.hot.data.baseClass) {
    baseClass.value = import.meta.hot.data.baseClass
  }

  // 监听当前模块的热更新
  import.meta.hot.accept((updatedModules) => {
    console.log('当前组件已热更新')
    handleQuery(undefined, false)
  })

  // 在销毁前保存状态
  import.meta.hot.dispose((data) => {
    data.baseClass = baseClass.value
    console.log('保存状态:', data.baseClass)
  })
}

const autoHeight = (key: string) => {
  if (!needAutoHeight.value) return
  // console.log('重建dom', new Date().getTime());
  nextTick(() => {
    if (
      baseClass.value &&
      typeof props.height == 'undefined' &&
      typeof props.maxHeight === 'undefined'
    ) {
      const tableHeaderHeight = getHeight('.el-card__header') //+ getHeight('.el-table__header-wrapper');
      const pageHeight = getHeight('.pagination-container')
      const { paddingTop: bodyPaddingTop, paddingBottom: bodyPaddingBottom } = getComputedStyle(
        '.table-plus .el-card__body'
      )
      const { borderTopWidth, borderBottomWidth } = getComputedStyle('.table-plus .el-card__header')
      const { height, dom } = getRemainingHeight(baseClass.value, [
        '.table-plus',
        ...props.autoHeightExcludeClassName,
      ])
      // console.log(dom)
      // console.log(height)
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
      dom.forEach((item) => {
        listenDoc.listen(item)
      })
      if (props.hasPage) listenDoc.listen('.pagination-container')
      // listenDoc.listen('.el-card__header');
      // listenDoc.listen('.el-table__header-wrapper');
    }
  })
}

//需要隐藏的表格列
const canHiddenColumns = computed({
  get() {
    return deepClone(tableColumn.value)
      .filter((item: { isTable: any }) => item.isTable || typeof item.isTable === 'undefined')
      .map(
        (
          item: { prop: any; label: any; visible: any; hidden: any; width: any; maxWidth: any },
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
      .filter((item: { hidden: any }) => item.hidden)
  },
  set(data) {
    data.forEach((item: { index: number; visible: boolean | undefined }) => {
      tableColumn.value[item.index].visible = item.visible
    })
  },
})
const tableColumn = ref<typeof props.tableColumn>([])
const tableColumnFinal = computed({
  get() {
    if (tableColumn.value.length === 0) {
      tableColumn.value = deepClone(props.tableColumn)
        .filter((item: { isTable: any }) => item.isTable || typeof item.isTable === 'undefined')
        .map((item: tableColumnItem, index: number) => {
          return computedTableColumn(item, index)
        })
    }
    return tableColumn.value
  },
  set(data) {
    tableColumn.value = [...data]
  },
})
const computedTableColumn = (item: tableColumnItem, index: number) => {
  if (props.isTree && index === 0 && !props.hasSelection) {
    item.align = 'left'
  }
  item.visible = item.visible ?? true
  item.sortable = item.sort ?? item.sortable ?? false
  if (typeof item.sortable === 'string' && props.sortable) {
    item.sortable = true
  }
  if (typeof item.sortable === 'boolean' && !props.sortable) {
    item.sortable = 'custom'
  }
  if ((item.list || []).length > 0) {
    item.sortable = false
    item.list = (item.list || []).map((item, index) => {
      return computedTableColumn(item, index)
    })
    return item
  }
  if (item.sortable) {
    item.sortProp = item.sortProp ?? item.prop
    sortProp.value[item.prop] = item.sortProp
  }
  if (slots[item.prop]) {
    item.slot = item.prop
  }
  item.selectable = item.selectable ?? true
  item.maxWidth = item.width ? false : item.maxWidth ?? props.maxWidth
  item.unit = item.unit ?? ''
  item.fun =
    item.fun ??
    ((
      row: dataItemType,
      prop: string,
      other?: {
        index?: number
        tableColumnFinal?: tableColumnItem[]
        [key: string]: any
      }
    ) => {
      let propss = [prop]
      if (prop.indexOf('.') > -1) {
        propss = prop.split('.')
      }
      let lscontent = row[propss[0]]
      for (let i = 1; i < propss.length; i++) {
        const item1 = propss[i]
        lscontent = (lscontent as ObjectType)?.[item1] || undefined
      }
      const content = String(
        typeof lscontent == 'number'
          ? (lscontent as number).toFixed(
              item.decimalPlaces || 0 || Number((String(lscontent).split('.')[1] || '').length || 0)
            )
          : lscontent ?? props.defaultBlock
      )
      const unit =
        typeof item.unit == 'string' ? item.unit : (item.unit && item.unit(row, prop, other)) ?? ''
      return content != props.defaultBlock ? content + unit : content
    })
  if (item.list)
    item.list = (item.list || []).map((listfun) => {
      listfun.fun =
        listfun.fun ??
        ((
          row: dataItemType,
          prop: string,
          other?: {
            index?: number
            tableColumnFinal?: tableColumnItem[]
            searchValue?: { [key: string]: any }
            [key: string]: any
          }
        ) =>
          String(
            typeof row[prop] == 'number'
              ? (row[prop] as number).toFixed(item.decimalPlaces)
              : row[prop] ?? props.defaultBlock
          ) +
          (typeof listfun.unit == 'string'
            ? listfun.unit
            : (listfun.unit && listfun.unit(row, prop, other)) ?? ''))
      return listfun
    })
  return item
}
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
// ======================== 新增：Emit 相关核心类型定义 ========================
// 1. 表格行数据类型（与 props.dataList 结构对齐）
type TableRowData = dataItemType // 复用组件内已定义的 dataItemType

// 2. 表格查询参数类型（与 queryParams 结构对齐，含分页信息）
type TableQueryParams = query // 复用组件内已定义的 query 类型

// 3. 导出操作的回调函数类型（用于控制导出加载状态）
type ExportCallback = (
  url?: string,
  params?: {
    [key: string]: any
  },
  fileName?: string,
  methods?: 'get' | 'post'
) => void

// 4. 删除操作的回调函数类型（用于控制删除结果和加载状态）
type RemoveCallback = (flag: boolean | string | Promise<any>) => void

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
   */
  (eventName: 'add', callback?: RemoveCallback): void

  /**
   * 行内修改按钮点击事件
   * @param eventName 事件名：固定为 'update'
   * @param row 当前行数据
   */
  (eventName: 'update', row: TableRowData, callback?: RemoveCallback): void

  /**
   * 行内详情按钮点击事件
   * @param eventName 事件名：固定为 'detail'
   * @param row 当前行数据
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
   */
  (eventName: 'batch-remove', selectedRows: TableRowData[], callback?: RemoveCallback): void

  /**
   * 导入按钮点击事件
   * @param eventName 事件名：固定为 'import'
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
      [key: string]: any // 扩展字段（如查询条件）
      multipleSelection: TableRowData[] // 选中的行数据（用于批量导出）
    },
    callback: ExportCallback
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
      data: any
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
const originalData = ref<any[]>()
//树形表格存储子数据
const dataChildrenListMap = ref<{ [key: string]: any[] }>({})
//树形表格存储展开子数据
const dataExpandMap = ref<{ [key: string]: { row: any; treeNode: any; resolve: any } }>({})
const treeConfig = ref<IsTreeConfig>(undefined)
//多选事件
const selectable = (row: tableColumnItem) => row.selectable
//多选数据
const multipleSelection = ref<any[]>([])
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
//行展开
const tableRowStatusChange = (row: any, expandedRows: any[] | boolean): void => {
  if (proxyProps.value['onExpandChange']) emits('expand-change', row, expandedRows)
  else if (!expandedRows) {
    delete dataExpandMap.value[String(row[treeConfig.value.id])]
  }
}
const handleCurrentChange = (val: any) => {
  if (proxyProps.value['onCurrentChange']) emits('current-change', val)
}
const setCurrentRow = (val: any) => {
  tableRef.value?.setCurrentRow(val)
}
//排序
const onSort = (data: {
  column: TableColumnCtx
  prop: string
  order: 'descending' | 'ascending' | undefined
}): void => {
  if(data.column.sortable==true){
    return
  }
  if (typeof data.order !== 'undefined') {
    sortPropData.value[data.prop] = props.sortableConfig[data.order]
  } else {
    delete sortPropData.value[data.prop]
  }

  handleQuery()
}
//排序参数键名对照
const sortProp = ref<{ [key: string]: any }>({})
//排序数据
const sortPropData = ref<{ [key: string]: any }>({})
const sortPropDataComputed = computed(() => {
  const queryParam = {
    [props.searchSortableConfig.fieId]: '',
    [props.searchSortableConfig.fieVal]: '',
  }
  for (const sortPropDatum in sortPropData.value) {
    if (typeof sortPropData.value[sortPropDatum] == 'undefined') continue
    queryParam[props.searchSortableConfig.fieId] += ',' + sortProp.value[sortPropDatum]
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
const getChildrenList = async (row: any, treeNode: unknown, resolve: (data: any[]) => void) => {
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
  if (typeof isFirst === 'boolean' && isFirst) {
    queryParam.pageNum = 1
  }
  setCurrentRow(null)
  queryParams.value = { ...queryParam, ...sortPropDataComputed.value }
  // queryParam = { ...queryParam, ...sortPropDataComputed.value };
  if (!props.dataListFun) {
    emits('query', queryParam)
  } else {
    props.dataListFun(queryParam, async (res: string | Promise<any> | any[], ...obj: any[]) => {
      let computedData: { [key: string]: any } = {}
      try {
        if (res instanceof Promise) {
          computedData = await (res as Promise<any>)
        } else if (res instanceof String && props.dataLoadFun) {
          const query = {
            url: res,
            method: obj[1] ?? 'GET',
            params: obj[0],
            data: obj[0],
          }
          if (query.method.toLowerCase() === 'get') {
            delete query.data
          } else {
            delete query.params
          }
          try {
            computedData = await props.dataLoadFun(query)
          } catch (err) {
            computedData = {
              [props.dataConfig.rows]: [],
              [props.dataConfig.total]: 0,
              [props.dataConfig.extra]: {},
            }
          }
        } else {
          computedData = {
            [props.dataConfig.rows]: res,
            [props.dataConfig.total]: obj[0],
            [props.dataConfig.extra]: obj[1],
          }
        }

        const datas = computedData[props.dataConfig.rows]
        const extras = computedData[props.dataConfig.extra] || {}
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
          const tempMap: { [key: string]: any } = {}
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
        const total = props.hasPage ? computedData[props.dataConfig.total] : 0
        if (proxyProps.value['onDataLoadCompleted']) emits('dataLoadCompleted', datas, total)
        dataListComputed.value = datas
        totalComputed.value = total
        extra.value = extras
      } catch (e) {
      } finally {
        loading.value = false
      }
    })
  }
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
    url: any,
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

const handleUpdate = (row: dataItemType) => {
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
const removeCallback = async (flag: string | boolean | Promise<any> = true, ...obj: any[]) => {
  if (flag instanceof Promise) {
    try {
      const res = await (flag as Promise<any>)
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
      const res = await props.dataLoadFun(query)
      flag = res[props.code] == props.status
    } catch (e) {
    } finally {
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
//计算表格按钮文字
const getOperationLabel = (
  hasXXX: typeof props.hasDetail,
  scope: {
    row: any
  },
  defaultLabel: string
) => {
  const hasOperationName = props.hasOperationName
  if (typeof hasXXX === 'boolean') {
    return defaultLabel
  }

  if (typeof hasXXX === 'function') {
    if (!hasOperationName) return ''

    const result = hasXXX(scope.row)
    return typeof result === 'boolean' ? defaultLabel : result
  }

  return hasXXX ?? defaultLabel
}
const handleRemove = (row: dataItemType) => {
  operationLoading.value = true
  ElMessageBox.confirm(props.removeMessage, props.removeType, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: props.removeMessageTitle,
    type: props.removeType,
  })
    .then(() => {
      emits('remove', row, (flag: string | boolean | Promise<any> = true, ...obj: any[]) => {
        removeCallback(flag, ...obj)
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
      emits(
        'batch-remove',
        multipleSelection.value,
        async (flag: string | boolean | Promise<any> = true, ...obj: any[]) => {
          await removeCallback(flag, ...obj)
        }
      )
    })
    .catch(() => {
      operationLoading.value = false
    })
}
const handleDetail = (row: dataItemType) => {
  if (proxyPropsParamsInfo.value['onDetail']) {
    operationLoading.value = true
    emits('detail', row, () => {
      operationLoading.value = false
    })
  } else {
    emits('detail', row)
  }
}
const handleAddSon = (row: dataItemType) => {
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
const updateLoading = (cb: Promise<any>, refresh: 'now' | 'first' | '' = 'now') => {
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
  data: any
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
        async (flag: string | boolean | Promise<any> = true, ...obj: any[]) => {
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
  slots,
  handleNeedConfirmEvent,
  originalData: originalData.value,
  updateLoading,
  setCurrentRow,
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
</style>
