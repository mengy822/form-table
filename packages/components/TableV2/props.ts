import zhCn from 'element-plus/es/locale/lang/zh-cn';
export interface tableColumnItem {
  prop: String
  label: String
  isTable?: Boolean
  isForm?: Boolean
  showOverflow?: Boolean
  width?: Number
  unit?: String //单位
  hidden?: Boolean
  visible?: Boolean
  align?: 'center' | 'left' | 'right'
  fixed?: false | true | 'left' | 'right'
  selectable?: Boolean
  maxWidth?: Boolean
  fun?: (row: dataItemType, prop: String, index?: Number) => String
  funDom?: VNode | Component
  classFun?: (row: dataItemType, prop: String) => String
  showFun?: (row?: queryParamType | any) => Boolean
  slot?:String
  render?:Function
}
type HeaderClassGetter = (param: {
  columns: Column<any>[]
  headerIndex: Number
}) => String

type HeaderPropsGetter = (param: {
  columns: Column<any>[]
  headerIndex: Number
}) => Record<String, any>

type HeaderCellPropsGetter = (param: {
  columns: Column<any>[]
  column: Column<any>
  columnIndex: Number
  headerIndex: Number
  style: CSSProperties
}) => Record<String, any>

type RowClassGetter = (param: {
  columns: Column<any>[]
  rowData: any
  rowIndex: Number
}) => String

type RowPropsGetter = (param: {
  columns: Column<any>[]
  rowData: any
  rowIndex: Number
}) => Record<String, any>

type CellPropsGetter = (param: {
  column: Column<any>
  columns: Column<any>[]
  columnIndex: Number
  cellData: any
  rowData: any
  rowIndex: Number
}) => void

type DataGetterParams<T> = {
  columns: Column<T>[]
  column: Column<T>
  columnIndex: Number
} & RowCommonParams

type DataGetter<T> = (params: DataGetterParams<T>) => T

type CellRenderProps<T> = {
  cellData: T
  column: Column<T>
  columns: Column<T>[]
  columnIndex: Number
  rowData: any
  rowIndex: Number
}

type HeaderRenderProps<T> = {
  column: Column<T>
  columns: Column<T>[]
  columnIndex: Number
  headerIndex: Number
}

type ScrollParams = {
  xAxisScrollDir: 'forward' | 'backward'
  scrollLeft: Number
  yAxisScrollDir: 'forward' | 'backward'
  scrollTop: Number
}

type CellSlotProps<T> = {
  column: Column<T>
  columns: Column<T>[]
  columnIndex: Number
  depth: Number
  style: CSSProperties
  rowData: any
  rowIndex: Number
  isScrolling: Boolean
  expandIconProps?:
    | {
        rowData: any
        rowIndex: Number
        onExpand: (expand: Boolean) => void
      }
    | undefined
}

type HeaderSlotProps = {
  cells: VNode[]
  columns: Column<any>[]
  headerIndex: Number
}

type HeaderCellSlotProps = {
  class: String
  columns: Column<any>[]
  column: Column<any>
  columnIndex: Number
  headerIndex: Number
  style: CSSProperties
  headerCellProps?: any
  sortBy: SortBy
  sortState?: SortState | undefined
  onColumnSorted: (e: MouseEvent) => void
}

type RowCommonParams = {
  rowData: any
  rowIndex: Number
}

type RowEventHandlerParams = {
  rowKey: KeyType
  event: Event
} & RowCommonParams

type RowEventHandler = (params: RowEventHandlerParams) => void
type RowEventHandlers = {
  onClick?: RowEventHandler
  onContextmenu?: RowEventHandler
  onDblclick?: RowEventHandler
  onMouseenter?: RowEventHandler
  onMouseleave?: RowEventHandler
}

type RowsRenderedParams = {
  rowCacheStart: Number
  rowCacheEnd: Number
  rowVisibleStart: Number
  rowVisibleEnd: Number
}

type RowSlotProps = {
  columns: Column<any>[]
  rowData: any
  columnIndex: Number
  rowIndex: Number
  data: any
  key: Number | String
  isScrolling?: Boolean
  style: CSSProperties
}

type RowExpandParams = {
  expanded: Boolean
  rowKey: KeyType
} & RowCommonParams

type Data = {
  [key: KeyType]: any
  children?: Array<any>
}

type FixedData = Data

type KeyType = String | Number | symbol

type ColumnSortParam<T> = { column: Column<T>; key: KeyType; order: SortOrder }

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

type SortBy = { key: KeyType; Order: SortOrder }
type SortState = Record<KeyType, SortOrder>
export const propsConfig={
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
    type: [Boolean, Function] as PropType<Boolean | ((row: any, index: Number) => Boolean)>,
    default: false,
  },

  hasOperation: {
    type: [Boolean, String],
    default: true,
  },
  hasAdd: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: false,
  },
  hasDetail: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasUpdate: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  hasRemove: {
    type: [Boolean, String, Function] as PropType<
      boolean | string | ((data: dataItemType) => boolean | string)
    >,
    default: true,
  },
  //为了更好的渲染效果预先多加载的行数	Number	2
  cache:{
    type:Number,
    default:2
  }	,
  //渲染动态的单元格的预估高度	Number	—
  estimatedRowHeight:{
    type:Number,
  }	,
  //header 部分的自定义 class 名	String / Function<HeaderClassGetter>	—
  headerClass	:{
    type:[String , Function<HeaderClassGetter>],
  }	,
//header 部分的自定义 props 名	Object / Function<HeaderPropsGetter>	—
headerProps	:{
    type:[Object , Function<HeaderPropsGetter>],
  }	,
//header cell 部分的自定义 props 名	Object / Function<HeaderCellPropsGetter>	—
headerCellProps	:{
    type:[Object , Function<HeaderCellPropsGetter>],
  }	,
//	Header 的高度由height设置。 如果传入数组，它会使 header row 等于数组长度	Number/ Number[]	50
headerHeight:{
    type:[Number,Array<Number>],
    default:50
  }	,
//Footer 部分的高度，当传入值时，这部分将被计算入 table 的高度里	Number	0
footerHeight	:{
    type:Number,
    default:0
  }	,
//row wrapper 部分的自定义 class 名	String / Function<RowClassGetter>	—
rowClass	:{
    type:[String , Function<RowClassGetter>],
  }	,
//每行的 key 值，如果不提供，将使用索引 index 代替	String / Symbol / Number	id
rowKey	:{
    type:[String , Symbol , Number],
    default:'id'
  }	,
//row component 部分的自定义 class 名	Object / Function<RowPropsGetter>	—
rowProps	:{
    type:[Object, Function<RowPropsGetter>],
  }	,
//每行的高度, 用于计算表的总高度	Number	50
rowHeight	:{
    type:Number,
    default:50
  }	,
//当每行添加了一系列事件处理器时触发	Object<RowEventHandlers>	—
rowEventHandlers	:{
    type:Object<RowEventHandlers>,
  }	,
//每个单元格 cell 的自定义 props (除了 header cell 以外)	Object / Function<CellPropsGetter>	—
cellProps	:{
    type:[Object , Function<CellPropsGetter>],
  }	,
//列 column 的配置数组	Column[]	—
columns	:{
    type:Array<tableColumnItem>,
    required:true
  }	,
//要在表中渲染的数据数组	Data[]	[]
data	:{
    type:Array<dataItemType>,
    default:()=>{
      return []
    }
  }	,
//一个自定义方法从数据源获取数据	Function<DataGetter<T>>	—
dataGetter	:{
    type:Function<DataGetter<T>>,
  }	,
//渲染行在表格主内容上方和 header 下方区域的数据	Object<Data>	—
fixedData	:{
    type:Object<Data>,
  }	,
//	列的 key 来标记哪个行可以被展开	String	—
expandColumnKey:{
    type:String,
  }	,
//	存放行展开状态的 key 的数组，可以和 v-model 搭配使用	KeyType[]	—
expandedRowKeys:{
    type:Array<KeyType>,
  }	,
//	默认展开的行的 key 的数组, 这个数据不是响应式的	KeyType[]	—
defaultExpandedRowKeys:{
    type:Array<KeyType>,
  }	,
//表格的类名称，将应用于表格的全部的三个部分 (左、右、主)	String / Array / Object	—
class	:{
    type:[String , Array , Object],
  }	,
//单元格宽度是自适应还是固定	Boolean	false
fixed	:{
    type:Boolean,
    default:()=>{
      return false
    }
  }	,
//required	表格的宽度	Number	—
width :{
    type:Number,
    required:true
  }	,
//required	表格的高度	Number	—
height :{
    type:Number,
    required:true
  }	,
//表格的最大高度	Number	—
maxHeight	:{
    type:Number,
  }	,
//树形表的水平缩进	Number	12
indentSize	:{
    type:Number,
    default:12
  }	,
//配置表格的水平滚动条大小，防止水平和垂直滚动条重叠。	Number	6
hScrollbarSize	:{
    type:Number,
    default:6
  }	,
//配置表格的垂直滚动条大小，防止水平和垂直滚动条重叠。	Number	6
vScrollbarSize	:{
    type:Number,
    default:6
  }	,
//如果开启，滚动条将一直显示，反之只会在鼠标经过时显示。	Boolean	false
scrollbarAlwaysOn	:{
    type:Boolean,
    default:()=>{
      return false
    }
  }	,
//排序方式	Object<SortBy>	{}
sortBy	:{
    type:Object<SortBy>,
    default:()=>{
      return {}
    }
  }	,
//多个排序	Object<SortState>	undefined
sortState	:{
    type:Object<SortState>,
  }	,
}
