// 1. 导入 createApp 和 App 组件
import { createApp } from 'vue'
import App from './App.vue'

// 2. 从 element-plus 中导入插件和样式
import ElementPlus, { ElTooltip } from 'element-plus'
import 'element-plus/dist/index.css'

import XEUtils from 'xe-utils'

// 1. 导入核心库 和 国际化（按需引入默认不带国际化）
// import {
//   VXETable,        // 核心对象（用于全局配置）
//   Table,           // 表格主组件 vxe-table
//   Column,          // 表格列 vxe-column
//   Colgroup,        // 列组 vxe-colgroup（可选，如果你需要多级表头）
//   Grid,
//   Toolbar
// } from 'vxe-table'
// import VxeUITable from 'vxe-table'
import VXETable from 'vxe-table'
// 2. 导入样式（必须）
import 'vxe-table/lib/style.css'

// 3. 【新增】导入所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 4. 创建 Vue 应用实例
const app = createApp(App)

// 5. 【新增】全局注册所有图标组件
// 遍历导入的图标对象，将每个图标注册为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 在 app.use(VXETable) 之前注册
VXETable.renderer.add('MyElTooltip', {
  renderTooltip(h, renderOpts, params) {
    const { column } = params
    console.log(column)
    const tipContent = column.titleHelp?.message || column.titleHelp

    if (!tipContent) return null

    // 返回 el-tooltip 的渲染结果
    return h(ElTooltip, {
      placement: column.titleHelp?.placement || 'top',
    }, () => [
      tipContent
    ])
  }
})
// 6. 使用 app.use() 方法全局注册 Element Plus 插件
app.use(ElementPlus)
// app.use(Grid)
// app.use(Toolbar)
// app.component('VxeTooltip', ElTooltip)
app.use(VXETable)
// app.component('VxeTable', Table)
// app.component('VxeColumn', Column)
// app.component('VxeColgroup', Colgroup)
// 7. 挂载应用
app.mount('#app')
