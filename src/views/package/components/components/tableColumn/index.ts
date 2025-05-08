import { generateColumnSlot } from '../../utils/findSlots'
import { h } from 'vue'
import { ElTableColumn } from 'element-plus'
export default {
  name: 'MyTableColumn',
  components: {
        ElTableColumn,
    },
  setup() {
    // 渲染列的信息, renderColumnList不可为箭头函数,因为call不能改变其this指向
    function renderColumnList(columns = []) {
      const $self = this
      return columns.map((column) => {
        if(column.hidden && !column.visible){
          return undefined
        }
        let slot: { header?: (scope) => Function; default?: (scope) => Function } = {} // 插槽
        if (column.header) {
          // generateColumnSlot 从自身往上找指定的插槽
          slot.header = (scope) => generateColumnSlot.call($self, column.header, scope) // 自定义表头
        }
        slot.default = (scope) => {
          const { row, $index } = scope
          // 顺序：multiHeader->render->slot->prop->default
          if (Array.isArray(column.list) && column.list.length) {
            // 多级表头,递归调用
            return renderColumnList.call($self, column.list)
          } else if (column.render && typeof column.render === 'function') {
            // 用户指定了render函数, render函数作用:计算后的值,不包含标签
            return h('span', column.render(row, $index))
          } else if (column.slot) {
            return generateColumnSlot.call($self, column.slot, {row,prop:column.prop,index:$index,fun:column.fun})
          } else if (column.prop) {
            if(!column.fun)column.fun=(row,prop)=>row[prop]??'-'
            return h('span',{
              class:`span span_${column.prop} span_${column.prop}_${row[column.prop]} span_other_${column.classFun && column.classFun(row, column.prop)} ${typeof row[column.prop]}`
            }, column.fun && column.fun(row, column.prop, $index))
          } else {
            return generateColumnSlot.call($self, 'default', scope)
          }
        }
        // 引用组件方式：h(resolveComponent("ElTableColumn")) 加载全局组件；也可h(ElTableColumn),但需在compoennts注册或在组合式API中导入
        // genColumnProps 生成当前列的参数对象
        return h(ElTableColumn, {
          prop:column.prop||column.label,
          label:column.label,
          fixed:column.fixed ?? false,
          minWidth:column.width ?? 100,
          align:column.align ?? 'center',
          showOverflowTooltip:column.showOverflow ?? true,
          className:column.hidden&&!column.visible?'table-column-hidden':'',
        }, slot)
      }).filter(item=>item)
    }
    return {
      renderColumnList,
    }
  },
  render() {
    const { tableColumnFinal } = this.$attrs
    const { renderColumnList } = this
    const $self = this
    return renderColumnList.call($self, tableColumnFinal) // renderColumnList内部需借助当前this查找父组件
  },
}
