<script lang="ts">
import {
  defineComponent,
  markRaw,
  ref,
  nextTick,
  computed,
  h,
  VNode,
  Fragment,
  onBeforeUnmount,
} from 'vue' // [优化] 添加 onBeforeUnmount
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ElConfigProvider, ElDescriptions, ElDescriptionsItem, ElButton } from 'element-plus'
import { deepClone, getDomComputed, getComputedStyle } from '../js/utils'
import MyDialog from '../Dialog/index.vue'
import { dataItemType, ObjectType } from '../js/types'
import { tableColumnItem } from '../Table/index.vue'

type MyDialogInstance = InstanceType<typeof MyDialog>

interface DesDialogProps {
  language?: object
  width?: string
  labelWidth?: string
  title?: string
  desBorder?: boolean
  desColumn?: number
  desDirection?: 'vertical' | 'horizontal'
  desSize?: '' | 'large' | 'default' | 'small'
  desTitle?: string
  desExtra?: string
  column?: (tableColumnItem & { useRander?: boolean })[]
  defaultBlock?: string
  dataConfig?: { data: string; status: string | number | boolean; code: string }
  nestedDefaultBorder?: boolean
  sonDirection?: 'vertical' | 'horizontal' // [优化] 补充缺失的 props 类型定义
}

interface NestedDescriptionsConfig {
  border?: boolean
  column?: number
  direction?: 'vertical' | 'horizontal'
  size?: '' | 'large' | 'default' | 'small'
}

// 分隔符列表
const SEPARATORS = [',', '~', '-', '/'] as const
type Separator = (typeof SEPARATORS)[number]

// 判断是否为有效的嵌套配置
const isValidNestedList = (list: any): boolean => {
  return Array.isArray(list) && list.length > 0
}

export default defineComponent({
  name: 'MyDetail',
  components: {
    MyDialog,
    ElConfigProvider,
    ElDescriptions,
    ElDescriptionsItem,
    ElButton,
  },
  props: {
    language: {
      type: Object,
      default: () => zhCn,
    },
    width: {
      type: String,
      default: '50%',
    },
    labelWidth: {
      type: String,
      default: '72px',
    },
    title: {
      type: String,
      default: '详情',
    },
    desBorder: {
      type: Boolean,
      default: false,
    },
    desColumn: {
      type: Number,
      default: 2,
    },
    desDirection: {
      type: String as () => 'vertical' | 'horizontal',
      default: 'horizontal',
    },
    sonDirection: {
      type: String as () => 'vertical' | 'horizontal',
      default: 'vertical',
    },
    desSize: {
      type: String as () => '' | 'large' | 'default' | 'small',
      default: '',
    },
    desTitle: {
      type: String,
      default: '',
    },
    desExtra: {
      type: String,
      default: '',
    },
    column: {
      type: Array as () => (tableColumnItem & { useRander?: boolean })[],
      required: true,
    },
    defaultBlock: {
      type: String,
      default: '-',
    },
    dataConfig: {
      type: Object,
      default: () => ({ data: 'data', status: 200, code: 'code' }),
    },
    nestedDefaultBorder: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['close'],
  setup(props, { slots, emit, attrs, expose }) {
    const myDialog = ref<MyDialogInstance | null>(null)
    const dataFinal = ref<{ [key: string]: any }>({})
    const maxWidth = ref('400px')
    // [优化] 添加组件缓存，避免重复创建
    const componentCache = ref<Map<string, any>>(new Map())

    const display = computed(() => {
      return slots.left || slots.right ? 'grid' : 'block'
    })

    const gridTemplateColumns = computed(() => {
      return `${slots.left ? 'auto ' : ''}1fr${slots.right ? ' auto' : ''}`
    })

    // [优化] 优化 desBorder 计算属性，避免每次都遍历
    const hasNestedItems = computed(() => {
      return columnFinal.value.some((item) => isValidNestedList(item.list))
    })

    const desBorder = computed(() => {
      return props.desBorder || hasNestedItems.value
    })

    const createMarkRaw = (
      myRender: tableColumnItem['funDom'],
      data: dataItemType,
      prop: string,
      other = {}
    ) => {
      // [优化] 使用缓存避免重复创建相同的组件
      const cacheKey = `${prop}_${JSON.stringify(Object.keys(data))}`
      if (componentCache.value.has(cacheKey)) {
        return componentCache.value.get(cacheKey)
      }

      const innerother = {
        ...other,
        ...attrs,
        loading: false,
        renderTxt: (context: string | number | boolean) => context ?? props.defaultBlock,
      }
      const component = markRaw({
        render() {
          return myRender!(data, prop, innerother)
        },
      })

      componentCache.value.set(cacheKey, component)
      return component
    }

    // 获取字段值的辅助函数（支持点号路径）
    const getValueByPath = (obj: any, path: string): any => {
      if (!path) return undefined
      if (path.indexOf('.') === -1) {
        return obj[path]
      }
      const keys = path.split('.')
      let result = obj
      for (const key of keys) {
        if (result === null || result === undefined) return undefined
        result = result[key]
      }
      return result
    }

    // 处理带分隔符的 prop，获取拼接后的数据和样式
    const getSplitColumnData = (
      column: tableColumnItem,
      rowData: any,
      separator: Separator,
      other?: any
    ): { content: string; classNames: string } => {
      const itemprops = column.prop.split(separator)
      const contents: string[] = []
      const classNamesList: string[] = []

      itemprops.forEach((propPath: string) => {
        let value: any
        if (column.fun) {
          value = column.fun(rowData, propPath.trim(), other)
        } else {
          value = getValueByPath(rowData, propPath.trim())
        }

        let content = String(
          typeof value === 'number' && column.decimalPlaces && column.decimalPlaces > 0
            ? value.toFixed(column.decimalPlaces)
            : value ?? props.defaultBlock
        )

        const unit =
          typeof column.unit === 'string'
            ? column.unit
            : (column.unit && column.unit(rowData, propPath.trim(), other)) ?? ''

        if (content !== props.defaultBlock && unit) {
          content = content + unit
        }

        contents.push(content)

        if (column.classFun) {
          const className = column.classFun(rowData, propPath.trim(), other) || ''
          if (className) classNamesList.push(className)
        }
      })

      return {
        content: contents.join(separator),
        classNames: classNamesList.join(separator),
      }
    }

    const getColumnData = (
      columnColumn: tableColumnItem,
      rowData: any = dataFinal.value,
      other?: any
    ): { content: string; classNames: string } => {
      if (isValidNestedList(columnColumn.list)) {
        return { content: '', classNames: '' }
      }

      const nowSeparator = SEPARATORS.find((item) => columnColumn.prop.indexOf(item) > -1)

      if (nowSeparator) {
        return getSplitColumnData(columnColumn, rowData, nowSeparator, other)
      }

      let content: string
      if (columnColumn.fun) {
        content = columnColumn.fun(rowData, columnColumn.prop, other) ?? props.defaultBlock
      } else {
        let value = getValueByPath(rowData, columnColumn.prop)
        content = String(
          typeof value === 'number' && columnColumn.decimalPlaces && columnColumn.decimalPlaces > 0
            ? value.toFixed(columnColumn.decimalPlaces)
            : value ?? props.defaultBlock
        )

        const unit =
          typeof columnColumn.unit === 'string'
            ? columnColumn.unit
            : (columnColumn.unit && columnColumn.unit(rowData, columnColumn.prop, other)) ?? ''

        if (content !== props.defaultBlock && unit) {
          content = content + unit
        }
      }

      let classNames = ''
      if (columnColumn.classFun) {
        classNames = columnColumn.classFun(rowData, columnColumn.prop, other) || ''
      }

      return { content, classNames }
    }

    const hasNestedData = (item: tableColumnItem): boolean => {
      return isValidNestedList(item.list)
    }

    // [优化] 添加错误边界包装函数
    const withErrorBoundary = (renderFn: () => VNode | null, fallback?: VNode) => {
      try {
        const result = renderFn()
        return result !== null && result !== undefined ? result : fallback || null
      } catch (error) {
        console.error('渲染错误:', error)
        return fallback || h('div', { class: 'render-error', style: { color: 'red' } }, '渲染失败')
      }
    }

    // 处理 column，计算每个字段的位置和 span
    const processColumnsWithPosition = (
      columns: (tableColumnItem & { useRander?: boolean })[],
      startIndex: number = 0,
      nest: boolean = false,
      nowDesColumn: number = props.desColumn
    ): (tableColumnItem & {
      useRander?: boolean
      colIndex: number
    })[] => {
      const result: (tableColumnItem & {
        useRander?: boolean
        colIndex: number
      })[] = []
      let currentIndex = startIndex
      let desColumn = 0
      for (let i = 0; i < columns.length; i++) {
        const item = { ...columns[i] }
        const hasNested = hasNestedData(item)

        item.align = item.align ?? 'left'

        if (hasNested) {
          // 嵌套字段本身不占位，不加入结果
          // 让前一项占满剩余空间
          if (result.length > 0 && !nest) {
            const prevItem = result[result.length - 1]
            const remainingSpan = nowDesColumn - desColumn

            result[result.length - 1].span = remainingSpan + (prevItem.span || 0)
          }
          item.span = item.span ?? 1
          if (!nest) item.span = nowDesColumn

          result.push({
            ...item,
            colIndex: 1,
            list: processColumnsWithPosition(
              item.list || [],
              0,
              true,
              (item.list || [])[0].desColumn ?? props.desColumn
            ),
          })
          continue
        } else {
          let defaultSpan = 1
          if (isValidNestedList(item.list)) defaultSpan = nowDesColumn
          item.span = item.span ?? defaultSpan
          desColumn = item.span % nowDesColumn
        }
        // console.log(item.span,item.label,nowDesColumn,!nest)
        item.rowspan = item.rowspan ?? 1
        if (!item.showFun) item.showFun = () => true

        item.unit = item.unit ?? ''

        if (!item.fun && !hasNested) {
          item.fun = (row: any, prop: string, other?: any) => {
            const separator = SEPARATORS.find((sep) => prop.indexOf(sep) > -1)

            if (separator) {
              const itemprops = prop.split(separator)
              const contents: string[] = []

              itemprops.forEach((propPath) => {
                let propss = [propPath.trim()]
                if (propPath.indexOf('.') > -1) {
                  propss = propPath.split('.')
                }
                let lscontent = row[propss[0]]
                for (let j = 1; j < propss.length; j++) {
                  const item1 = propss[j]
                  lscontent = (lscontent as ObjectType)?.[item1] || undefined
                }
                const content = String(
                  typeof lscontent === 'number' && item.decimalPlaces && item.decimalPlaces > 0
                    ? (lscontent as number).toFixed(item.decimalPlaces)
                    : lscontent ?? props.defaultBlock
                )
                const unit =
                  typeof item.unit === 'string'
                    ? item.unit
                    : (item.unit && item.unit(row, propPath.trim(), other)) ?? ''
                contents.push(content !== props.defaultBlock ? content + unit : content)
              })

              return contents.join(separator)
            }

            let propss = [prop]
            if (prop.indexOf('.') > -1) {
              propss = prop.split('.')
            }
            let lscontent = row[propss[0]]
            for (let j = 1; j < propss.length; j++) {
              const item1 = propss[j]
              lscontent = (lscontent as ObjectType)?.[item1] || undefined
            }
            const content = String(
              typeof lscontent === 'number' && item.decimalPlaces && item.decimalPlaces > 0
                ? (lscontent as number).toFixed(item.decimalPlaces)
                : lscontent ?? props.defaultBlock
            )
            const unit =
              typeof item.unit === 'string'
                ? item.unit
                : (item.unit && item.unit(row, prop, other)) ?? ''
            return content !== props.defaultBlock ? content + unit : content
          }
        }

        result.push({ ...item, colIndex: currentIndex })
        currentIndex = (currentIndex + (item.span || 1)) % props.desColumn
      }

      return result
    }
    const deepColumn = computed(() => {
      return deepClone(props.column)
    })
    const columnFinal = computed(() => {
      const filtered = deepColumn.value.filter(
        (item: { isForm: any }) => typeof item.isForm === 'undefined' || item.isForm
      )
      const items = processColumnsWithPosition(filtered, 0)
      return items
    })

    // 构建普通描述列表
    const renderDescriptions = (
      items: any[],
      title: string = props.desTitle,
      desDirection: typeof props.desDirection = props.desDirection,
      desColumn: typeof props.desColumn = props.desColumn,
      labelWidth: typeof props.labelWidth = props.labelWidth
    ) => {
      const renderNormalItem = (item: any, renderLabel: any, renderDefaultContent: any) => {
        const showItem = item.showFun?.(dataFinal.value, item.prop) ?? true
        if (!showItem) return null

        return h(
          ElDescriptionsItem,
          {
            label: renderLabel,
            span: item.span,
            rowspan: item.rowspan,
            width: item.width,
            align: item.align,
            labelAlign: item.labelAlign,
            className: item.className,
            labelClassName: item.labelClassName,
          },
          {
            default: renderDefaultContent,
            label: renderLabel,
          }
        )
      }

      const allItems = items
        .map((item) => {
          const renderLabel = () => {
            const labelSlot = slots[`label_${item.prop}`]
            if (labelSlot) {
              return labelSlot({
                prop: item.prop,
                nowData: getValueByPath(dataFinal.value, item.prop),
                row: dataFinal.value,
              })
            }
            return h(Fragment, null, [item.label])
          }

          const renderDefaultContent = () => {
            const contentSlot = slots[item.prop]
            if (contentSlot) {
              return contentSlot({
                prop: item.prop,
                nowData: getValueByPath(dataFinal.value, item.prop),
                row: dataFinal.value,
              })
            }

            if (item.funDom) {
              const Component = createMarkRaw(item.funDom, dataFinal.value, item.prop)
              return h(Component)
            }

            const { content, classNames } = getColumnData(item, dataFinal.value, attrs)
            const finalClassNames = [
              `span span_${item.prop}`,
              `span_${item.prop}_${getValueByPath(dataFinal.value, item.prop)}`,
              classNames,
            ]
              .filter(Boolean)
              .join(' ')

            return h('span', { class: finalClassNames }, content)
          }

          if (isValidNestedList(item.list)) {
            return h(
              ElDescriptionsItem,
              {
                label: renderLabel,
                span: item.span,
                rowspan: item.rowspan,
                width: item.width,
                align: item.align,
                labelAlign: item.labelAlign,
                className: `${item.className} nesting`,
                labelClassName: item.labelClassName,
              },
              {
                default: () =>
                  renderDescriptions(
                    item.list,
                    '',
                    props.sonDirection,
                    item['desColumn'],
                    item['labelWidth']
                  ),
                label: renderLabel,
              }
            )
          }
          return renderNormalItem(item, renderLabel, renderDefaultContent)
        })
        .filter(Boolean)

      return withErrorBoundary(
        () =>
          h(
            ElDescriptions,
            {
              border: desBorder.value,
              column: desColumn,
              direction: desDirection,
              size: props.desSize,
              title: title,
              extra: props.desExtra,
              class: 'detail',
              labelWidth: labelWidth,
            },
            {
              default: () => allItems,
            }
          ),
        h('div', { class: 'render-error' }, '描述列表渲染失败')
      )
    }

    const renderLeftSlot = () => {
      if (!slots.left) return null
      return withErrorBoundary(() => slots.left!({ data: dataFinal.value }))
    }

    const renderRightSlot = () => {
      if (!slots.right) return null
      return withErrorBoundary(() => slots.right!({ data: dataFinal.value }))
    }

    const renderFooter = () => {
      if (slots.footer) {
        return withErrorBoundary(() => slots.footer!({ data: dataFinal.value }))
      }
      return h('div', { class: 'dialog-footer' }, [
        h(
          ElButton,
          {
            onClick: () => myDialog.value?.handleClose(),
          },
          '关闭'
        ),
      ])
    }
    const close = () => {
      myDialog.value?.handleClose()
    }
    const handleClose = (cb: () => void) => {
      dataFinal.value = {}
      // [优化] 清理组件缓存
      componentCache.value.clear()
      emit('close')
      cb()
    }

    const init = async (
      data: { [key: string]: any } | Promise<any> = {},
      openCb: (data: any) => void = () => {}
    ) => {
      let finaldata = {}
      if (data instanceof Promise) {
        let res
        try {
          res = await data
        } catch (e) {
          openCb({})
          return
        }
        if (res[props.dataConfig.code] === props.dataConfig.status) {
          finaldata = res[props.dataConfig.data]
        }
      } else {
        finaldata = { ...data }
      }
      dataFinal.value = { ...finaldata }
      myDialog.value?.init()
      nextTick(() => {
        const baseClassStyle = getComputedStyle(document.querySelector('.detailDialog'))
        // console.log(getDomComputed(baseClassStyle, 'height') ,className)
        maxWidth.value =
          getDomComputed(baseClassStyle, 'width') / props.desColumn -
          Number(props.labelWidth.replace('px', '')) +
          'px'

        openCb(dataFinal.value)
      })
    }

    const updateData = (prop: string, data: any): void => {
      dataFinal.value[prop] = data
    }

    const getData = (prop: string): any => {
      return dataFinal.value[prop]
    }

    // [优化] 组件卸载时清理缓存，防止内存泄漏
    onBeforeUnmount(() => {
      componentCache.value.clear()
    })

    expose({ init, close, updateData, getData })

    return () => {
      const detailContent = h(
        'div',
        {
          class: 'detailDialog',
          style: {
            display: display.value,
            gridGap: '20px',
            gridTemplateColumns: gridTemplateColumns.value,
            maxHeight: '50vh',
            overflowY: 'auto',
          },
        },
        [renderLeftSlot(), renderDescriptions(columnFinal.value), renderRightSlot()].filter(Boolean)
      )

      return h(
        ElConfigProvider,
        { locale: props.language },
        {
          default: () =>
            h(
              MyDialog,
              {
                ref: myDialog,
                width: props.width,
                title: props.title,
                onBeforeClose: handleClose,
                style: {
                  '--label-width': props.labelWidth,
                  '--maxWidth': maxWidth.value,
                },
              },
              {
                default: () => detailContent,
                footer: renderFooter,
              }
            ),
        }
      )
    }
  },
})
</script>

<style scoped lang="scss">
:deep(.el-descriptions__body) {
  .el-descriptions__table {
    .nesting {
      // padding: 0 !important;
    }
    tbody {
      tr {
        .el-descriptions__label {
          min-width: var(--label-width);
          // display: table-cell;
          // vertical-align: top;
        }

        .el-descriptions__content {
          //display: table-cell;
          word-break: break-all;
          word-wrap: break-word;
          vertical-align: top;
          width: calc(var(--maxWidth) - 0);
        }
        .el-descriptions__cell {
          // [优化] 删除注释掉的代码
        }
      }
    }
  }
}

.detailDialog {
  max-height: 50vh;
  overflow-y: auto;
}

// [优化] 添加错误状态样式
.render-error {
  padding: 20px;
  text-align: center;
  color: #f56c6c;
  background-color: #fef0f0;
  border-radius: 4px;
}
// :deep(.el-descriptions__content) {
//   max-width: var(--maxWidth);
// }
</style>
