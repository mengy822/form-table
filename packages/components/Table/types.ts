import { Component, CSSProperties, VNode } from "vue"

// 定义 Props 类型（提取为独立接口，增强可读性和复用性）
export interface TableProps {
    /** 是否显示分页 */
    hasPage: boolean
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
    tableColumn: Array<tableColumnItem>
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
    dataListFun?: Function
    /** 数据源格式配置（数据列表字段、总数字段） */
    dataConfig: { rows: string; total: string }
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
}

export interface query extends queryParamType {
    pageSize: number
    pageNum: number
}

export interface queryParamType {
    [key: string]: string | number | undefined | boolean
}

export interface dataItemType {
    [key: string]: string | number | undefined | boolean
}
export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
export interface tableColumnItem {
    prop: string
    label: string
    isTable?: boolean
    isForm?: boolean
    showOverflow?: boolean
    width?: number
    unit?: string //单位
    hidden?: boolean
    visible?: boolean
    align?: 'center' | 'left' | 'right'
    fixed?: false | true | 'left' | 'right'
    selectable?: boolean
    maxWidth?: boolean
    fun?: (
        row: dataItemType,
        prop: string,
        other?: {
            index?: number;
            tableColumnFinal?: tableColumnItem[];
            [key: string]: any;
        }
    ) => string;
    funDom?: VNode | Component
    classFun?: (row: dataItemType, prop: string,
        other?: {
            index?: number;
            tableColumnFinal?: tableColumnItem[];
            [key: string]: any;
        }
    ) => string
    showFun?: (row?: queryParamType | any) => boolean
    slot?: string
    // render?: any
    header?: string;
    list?: tableColumnItem[];
}