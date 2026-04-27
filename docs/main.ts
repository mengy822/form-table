// 1. 导入 createApp 和 App 组件
import { createApp } from 'vue'
import App from './App.vue'

// 2. 从 element-plus 中导入插件和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 3. 【新增】导入所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 4. 创建 Vue 应用实例
const app = createApp(App)

// 5. 【新增】全局注册所有图标组件
// 遍历导入的图标对象，将每个图标注册为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 6. 使用 app.use() 方法全局注册 Element Plus 插件
app.use(ElementPlus)

// 7. 挂载应用
app.mount('#app')
