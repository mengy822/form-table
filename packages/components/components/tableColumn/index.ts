import { generateColumnSlot } from '../../utils/findSlots'
import { h } from 'vue'
import { ElTableColumn, TableColumnCtx } from 'element-plus'
import { dataItemType } from '../TableOperations/index.vue'
import { tableColumnItem } from '@/components/Table/types'

export default {
  name: 'MyTableColumn',
  components: {
    ElTableColumn,
  },
  setup() {
    // 渲染列的信息, renderColumnList不可为箭头函数,因为call不能改变其this指向
    function renderColumnList(
      columns: tableColumnItem[] = [],
      align: string,
      other: {
        tableColumnFinal?: tableColumnItem[]
        defaultBlock?: string
        data?:any[];
        [key: string]: any
      } = {},
    ) {
      const $self = this
      return columns
        .map((column) => {
          if (column.hidden && !column.visible) {
            return undefined
          }
          const slot: { header?: (scope: any) => () => {}; default?: (scope: any) => () => {} } = {} // 插槽
          if (column.header) {
            // generateColumnSlot 从自身往上找指定的插槽
            slot.header = (scope) => {
              if (typeof column.header === 'string') {
                return generateColumnSlot.call($self, column.header as string, scope)
              }
              return column.header(column, other)
            } // 自定义表头
          }
          slot.default = (scope) => {
            // console.log(scope, column.label);
            const { row, $index } = scope
            if (column.showFun && !column.showFun(row, other)) {
              return undefined
            }
            // console.log(column);
            // 顺序：multiHeader->render->slot->prop->default
            if (Array.isArray(column.list) && column.list.length) {
              // 多级表头,递归调用
              // console.log('多级表头深度:', column.label, getDepth(column), '返回:', column.list);
              return null
              // return renderColumnList.call($self, column.list);
            } else if (column.slot) {
              // console.log(other.loading);
              return generateColumnSlot.call($self, column.slot, {
                row,
                prop: column.prop,
                index: $index,
                fun: column.fun,
                nowData: row[column.prop],
                loading: other.loading,
              })
            } else if (column.funDom) {
              return column.funDom(row, column.prop, other)
            } else if (column.prop) {
              delete other.tableColumnFinal
              other.index = $index
              // if (scope.$index != -1) console.log(column.label, column.prop, scope.row[column.prop], scope.row, scope.$index);
              // if (typeof column.fun === 'object' && Array.isArray(column.fun)) return hfun(column.fun);
              if (!column.fun) {
                column.fun = (
                  row: dataItemType,
                  prop: string,
                  other?: {
                    index?: number
                    tableColumnFinal?: tableColumnItem[]
                    searchValue?: { [key: string]: any }
                    [key: string]: any
                  },
                ) => {
                  const content = String(
                    typeof row[prop] == 'number' && (column.decimalPlaces || 0) > 0
                      ? (row[prop] as number).toFixed(column.decimalPlaces)
                      : (row[prop] ?? other?.defaultBlock),
                  )
                  //@ts-ignore
                  const unit =
                    typeof column.unit == 'string'
                      ? column.unit
                      : ((column.unit && column.unit(row, prop, other)) ?? '')
                  return content != other?.defaultBlock ? content + unit : content
                }
              }
              let dataType = typeof row[column.prop]
              const separator = [',', '~', '-', '/']
              const nowSeparator = separator.find((item) => column.prop.indexOf(item) > -1)
              let fundata = ''
              let data: string | number | undefined = ''
              let classs = ''
              if (nowSeparator) {
                // console.log(nowSeparator);
                const props = column.prop.split(nowSeparator)
                const fundatas: string[] = []
                const classss: string[] = []
                props.forEach((item) => {
                  fundatas.push((column.fun && column.fun(row, item, other))!)
                  classss.push((column.classFun && column.classFun(row, column.prop, other)) || '')
                })
                fundata = fundatas.join(nowSeparator)
                classs = classss.join(nowSeparator)
                data = fundata
                dataType = 'string'
              } else {
                column.type =
                  column?.type || (dataType as 'string' | 'number' | undefined) || 'string'

                fundata = column.fun && column.fun(row, column.prop, other)
                data =
                  column?.type === 'number'
                    ? (fundata ?? other.defaultBlock)
                    : fundata || other.defaultBlock
                // if (column.label == '播种故障') console.log(data, column.label);
                classs = (column.classFun && column.classFun(row, column.prop, other)) || ''
              }

              return h(
                'span',
                {
                  class: `span span_${column.prop} span_${column.prop}_${row[column.prop]} span_other_${classs} ${classs} ${dataType}`,
                },
                data,
              )
            } else {
              return generateColumnSlot.call($self, 'default', scope)
            }
          }
          if (Array.isArray(column.list) && column.list.length) {
            const ilike = column.ilike && false
            const filterMethod = column.filters
              ? column.filterMethod ||
                ((value: any, row: any, column: TableColumnCtx) => {
                  const property = column['property']
                  if (ilike) return row[property].toLowerCase().includes(value.toLowerCase())
                  return row[property] === value
                })
              : undefined
            return h(
              ElTableColumn,
              {
                prop: column.prop || column.label,
                columnKey: column.prop || column.label,
                label: column.label,
                fixed: column.fixed ?? false,
                minWidth: column.width ?? 100,
                align: column.align ?? 'center',
                sortable: column.sortable!,
                showOverflowTooltip: column.showOverflow ?? true,
                className: column.hidden && !column.visible ? 'table-column-hidden' : '',
                filters: column.filters
                  ? column.filters == true
                    ? (other?.data || [])
                        .map((item) => item[column.prop || column.label])
                        .filter((value, index, self) => self.indexOf(value) === index) // 去重
                        .map((value) => ({ text: value, value }))
                    : (column.filters as any[])
                  : undefined,
                filterMethod,
                filterPlacement: column.filterPlacement,
                filterMultiple: column.filterMultiple,
                filterClassName: column.filterClassName,
                tooltipFormatter: column.tooltipFormatter,
              },
              {
                default: () => renderColumnList.call($self, column.list, align, other),
              },
            )
          }
          // 引用组件方式：h(resolveComponent("ElTableColumn")) 加载全局组件；也可h(ElTableColumn),但需在compoennts注册或在组合式API中导入
          // genColumnProps 生成当前列的参数对象
          const ilike = column.ilike ?? false
          const filterMethod = column.filters
            ? column.filterMethod ||
              ((value: any, row: any, column: TableColumnCtx) => {
                const property = column['property']
                // console.log(
                //   row[property] == value,
                //   value,
                //   row[property],
                //   ilike,
                //   String(row[property]).toLowerCase().includes(String(value).toLowerCase()),
                // )
                if (ilike) return String(row[property]).toLowerCase().includes(String(value).toLowerCase())
                return row[property] == value
              })
            : undefined
          return h(
            ElTableColumn,
            {
              prop: column.prop || column.label,
              columnKey: column.prop || column.label,
              label: column.label,
              fixed: column.fixed ?? false,
              minWidth: column.width ?? 100,
              align: column.align ?? 'center',
              sortable: column.sortable!,
              showOverflowTooltip: column.showOverflow ?? true,
              className: column.hidden && !column.visible ? 'table-column-hidden' : '',
              filters: column.filters
                ? typeof column.filters == 'boolean'
                  ? (other?.data || [])
                      .map((item) => item[column.prop || column.label])
                      .filter((value, index, self) => self.indexOf(value) === index) // 去重
                      .map((value) => ({ text: value, value }))
                  : (column.filters as any[])
                : undefined,
              filterMethod,
              filterPlacement: column.filterPlacement,
              filterMultiple: column.filterMultiple,
              filterClassName: column.filterClassName,
              tooltipFormatter: column.tooltipFormatter,
            },
            slot,
          )
        })
        .filter((item) => item)
    }

    return {
      renderColumnList,
    }
  },
  render(): any {
    const { tableColumnFinal, align,data } = this.$attrs
    const { renderColumnList } = this
    const $self = this
    return renderColumnList.call($self, tableColumnFinal, align, {
      ...this.$attrs,
      renderTxt: (context: string | number | boolean) => context ?? this.$attrs.defaultBlock,
      data
    }) // renderColumnList内部需借助当前this查找父组件
  },
}
