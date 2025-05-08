import zhCn from 'element-plus/es/locale/lang/zh-cn';
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
  fun?: (row: dataItemType, prop: string, index?: number) => string
  funDom?: VNode | Component
  classFun?: (row: dataItemType, prop: string) => string
  showFun?: (row?: queryParamType | any) => boolean
  slot?:String
  render?:Function
}


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

  removeMessageTitle: {
    type: String,
    default: '警告',
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
}
