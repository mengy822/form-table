// types/table.ts

/**
 * 列固定方向
 */
export type FixedDir = 'left' | 'right';

/**
 * 表格单元格对齐方式
 */
export type Alignment = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';

/**
 * 键类型
 */
export type KeyType = string | number | symbol;

/**
 * 单元格渲染器属性
 */
export interface CellRenderProps<T = any> {
    /**
     * 当前行的数据
     */
    rowData: T;

    /**
     * 当前行的索引
     */
    rowIndex: number;

    /**
     * 单元格的值
     */
    cellValue: any;

    /**
     * 列的配置
     */
    column: TableColumn<T>;
}

/**
 * 头部渲染器属性
 */
export interface HeaderRenderProps<T = any> {
    /**
     * 列的配置
     */
    column: TableColumn<T>;

    /**
     * 列的索引
     */
    columnIndex: number;

    /**
     * 排序相关
     */
    sort?: {
        /**
         * 当前排序方向
         */
        direction: 'asc' | 'desc' | null;

        /**
         * 排序状态是否可以切换
         */
        sortable: boolean;
    };
}

/**
 * 表格列配置接口
 */
export interface TableColumn<T = any> {
    /**
     * 表格单元格内容对齐方式
     * @default 'left'
     */
    align?: Alignment;

    /**
     * 列的类名
     */
    class?: string;

    /**
     * 唯一标志
     */
    key?: KeyType;

    /**
     * data 的唯一标志符
     */
    dataKey?: KeyType;

    /**
     * 固定列位置
     * @default false
     */
    fixed?: boolean | FixedDir;

    /**
     * CSS 属性 flex grow, 仅当不是固定表时才生效
     * @default 0
     */
    flexGrow?: number;

    /**
     * CSS 属性 flex shrink, 仅当不是固定表时才生效
     * @default 1
     */
    flexShrink?: number;

    /**
   * 自定义 header 头部类名
   */
    headerClass?: string;

    /**
     * 此列是否不可见
     * @default false
     */
    hidden?: boolean;

    /**
     * 自定义列单元格的样式，将会与 gird 单元格合并
     */
    style?: Record<string, string | number>;

    /**
     * 设置列是否可排序
     * @default false
     */
    sortable?: boolean;

    /**
     * Header 头部单元格中的默认文本
     */
    title?: string;

    /**
     * 列的最大宽度
     */
    maxWidth?: number;

    /**
     * 列的最小宽度
     */
    minWidth?: number;

    /**
     * 列宽度（必需）
     */
    width: number;

    /**
     * 自定义单元格渲染器
     */
    cellRenderer?: any | ((props: CellRenderProps<T>) => any);

    /**
     * 自定义头部渲染器
     */
    headerCellRenderer?: any | ((props: HeaderRenderProps<T>) => any);

    /**
     * 列的唯一标识，如果未提供，将使用 key
     */
    id?: string;

    /**
     * 列的字段名，用于数据映射
     */
    field?: keyof T | string;

    /**
     * 是否显示此列
     * @default true
     */
    visible?: boolean;

    /**
     * 列的提示信息
     */
    tooltip?: string;

    /**
     * 列分组标题
     */
    group?: string;

    /**
     * 子列（用于列分组）
     */
    children?: TableColumn<T>[];

    /**
     * 列是否可调整大小
     * @default true
     */
    resizable?: boolean;

    /**
     * 列是否可拖拽重新排序
     * @default true
     */
    draggable?: boolean;

    /**
     * 格式化函数，用于格式化单元格显示值
     */
    formatter?: (value: any, rowData: T, rowIndex: number) => any;

    /**
     * 自定义单元格的类名
     */
    cellClass?: string | ((props: CellRenderProps<T>) => string);

    /**
     * 当单元格内容被点击时的回调函数
     */
    onClick?: (event: MouseEvent, props: CellRenderProps<T>) => void;

    /**
     * 排序函数
     */
    sorter?: (a: T, b: T) => number;

    /**
     * 列的默认排序方向
     */
    defaultSortOrder?: 'asc' | 'desc';

    /**
     * 过滤器函数
     */
    filter?: (value: any, row: T) => boolean;

    /**
     * 过滤选项列表
     */
    filterOptions?: Array<{
        label: string;
        value: any;
    }>;

    /**
     * 自定义编辑组件
     */
    editor?: any;

    /**
     * 列是否可编辑
     * @default false
     */
    editable?: boolean;

    /**
     * 验证规则
     */
    rules?: Array<{
        required?: boolean;
        pattern?: RegExp;
        message?: string;
        validator?: (value: any, row: T) => boolean;
    }>;
}

/**
 * 表格数据源接口
 */
export interface TableDataSource<T = any> {
    /**
     * 表格数据
     */
    data: T[];

    /**
     * 数据总数（用于分页）
     */
    total?: number;

    /**
     * 当前页码
     */
    currentPage?: number;

    /**
     * 每页大小
     */
    pageSize?: number;

    /**
     * 加载状态
     */
    loading?: boolean;

    /**
     * 错误信息
     */
    error?: Error | null;
}

/**
 * 表格排序状态
 */
export interface SortState<T = any> {
    /**
     * 排序的列
     */
    column: TableColumn<T>;

    /**
     * 排序方向
     */
    direction: 'asc' | 'desc';

    /**
     * 自定义排序函数
     */
    sorter?: (a: T, b: T) => number;
}

/**
 * 表格分页配置
 */
export interface PaginationConfig {
    /**
     * 当前页码
     * @default 1
     */
    current: number;

    /**
     * 每页显示条数
     * @default 10
     */
    pageSize: number;

    /**
     * 总条数
     */
    total: number;

    /**
     * 每页条数选项
     * @default [10, 20, 50, 100]
     */
    pageSizeOptions?: number[];

    /**
     * 是否显示快速跳转
     * @default false
     */
    showQuickJumper?: boolean;

    /**
     * 是否显示条数选择器
     * @default true
     */
    showSizeChanger?: boolean;

    /**
     * 是否显示总条数
     * @default true
     */
    showTotal?: boolean | ((total: number, range: [number, number]) => string);

    /**
     * 分页器尺寸
     * @default 'default'
     */
    size?: 'small' | 'default';
}

/**
 * 表格配置接口
 */
export interface TableConfig<T = any> {
    /**
     * 列配置
     */
    columns: TableColumn<T>[];

    /**
     * 数据源
     */
    dataSource?: TableDataSource<T>;

    /**
     * 行唯一键字段
     * @default 'id'
     */
    rowKey?: string | ((row: T) => string | number);

    /**
     * 是否显示边框
     * @default false
     */
    bordered?: boolean;

    /**
     * 是否显示斑马纹
     * @default false
     */
    striped?: boolean;

    /**
     * 是否显示表头
     * @default true
     */
    showHeader?: boolean;

    /**
     * 是否可多选
     * @default false
     */
    selectable?: boolean;

    /**
     * 是否显示序号列
     * @default false
     */
    showIndex?: boolean;

    /**
     * 是否可展开行
     * @default false
     */
    expandable?: boolean;

    /**
     * 分页配置
     */
    pagination?: PaginationConfig | boolean;

    /**
     * 加载状态
     */
    loading?: boolean;

    /**
     * 加载中占位符
     */
    loadingText?: string;

    /**
     * 空数据提示
     */
    emptyText?: string;

    /**
     * 表格高度
     */
    height?: number | string;

    /**
     * 表格最大高度
     */
    maxHeight?: number | string;

    /**
     * 虚拟滚动
     */
    virtualScroll?: boolean;

    /**
     * 行高
     * @default 50
     */
    rowHeight?: number;

    /**
     * 缓存行数
     * @default 10
     */
    bufferSize?: number;
}

/**
 * 表格事件定义
 */
export interface TableEvents<T = any> {
  /**
   * 排序变化事件
   */
  onSortChange?: (sortState: SortState<T>) => void;

  /**
   * 行点击事件
   */
  onRowClick?: (row: T, index: number, event: MouseEvent) => void;

  /**
   * 行双击事件
   */
  onRowDblClick?: (row: T, index: number, event: MouseEvent) => void;

  /**
   * 行右键事件
   */
  onRowContextMenu?: (row: T, index: number, event: MouseEvent) => void;

  /**
   * 选择变化事件
   */
  onSelectionChange?: (selectedRows: T[]) => void;

  /**
   * 单元格点击事件
   */
  onCellClick?: (row: T, column: TableColumn<T>, cellValue: any, event: MouseEvent) => void;

  /**
   * 分页变化事件
   */
  onPageChange?: (page: number, pageSize: number) => void;

  /**
   * 数据变化事件
   */
  onDataChange?: (data: T[]) => void;

  /**
   * 列宽变化事件
   */
  onColumnResize?: (column: TableColumn<T>, width: number) => void;

  /**
   * 列顺序变化事件
   */
  onColumnReorder?: (columns: TableColumn<T>[]) => void;

  /**
   * 行展开事件
   */
  onRowExpand?: (row: T, expanded: boolean) => void;
}

/**
 * 表格实例方法
 */
export interface TableInstance<T = any> {
    /**
     * 获取当前选中的行
     */
    getSelectedRows: () => T[];

    /**
     * 清除选择
     */
    clearSelection: () => void;

    /**
     * 全选
     */
    selectAll: () => void;

    /**
     * 反选
     */
    toggleSelection: (rows?: T[]) => void;

    /**
     * 设置当前排序
     */
    setSort: (columnKey: string | number, direction?: 'asc' | 'desc') => void;

    /**
     * 清除排序
     */
    clearSort: () => void;

    /**
     * 刷新数据
     */
    refresh: () => void;

    /**
     * 滚动到指定行
     */
    scrollToRow: (index: number) => void;

    /**
     * 获取表格数据
     */
    getData: () => T[];

    /**
     * 更新表格数据
     */
    setData: (data: T[]) => void;

    /**
     * 更新行数据
     */
    updateRow: (rowIndex: number, rowData: Partial<T>) => void;

    /**
     * 删除行
     */
    deleteRow: (rowIndex: number) => void;

    /**
     * 添加行
     */
    addRow: (rowData: T) => void;

    /**
     * 获取列配置
     */
    getColumns: () => TableColumn<T>[];

    /**
     * 更新列配置
     */
    updateColumns: (columns: TableColumn<T>[]) => void;
}

/**
 * 表格上下文
 */
export interface TableContext<T = any> {
    /**
     * 表格配置
     */
    config: TableConfig<T>;

    /**
     * 排序状态
     */
    sortState?: SortState<T>;

    /**
     * 选中的行
     */
    selectedRows: T[];

    /**
     * 展开的行
     */
    expandedRows: (string | number)[];

    /**
     * 当前列宽
     */
    columnWidths: Record<string, number>;

    /**
     * 列顺序
     */
    columnOrder: string[];
}