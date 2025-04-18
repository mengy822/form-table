// // /components/Loading/index.ts
// import type { App, VNode } from 'vue'
// import { createVNode, render } from "vue";
// import detail from './index.vue'

// export default {
//   install(app: App) {
//     const Vnode: VNode = createVNode(detail)
//     render(Vnode, document.body)
//     app.config.globalProperties.$detail = {
//       init: Vnode.component?.exposed?.init,
//       // hide: Vnode.component?.exposed?.hide,
//     }
//   }
// }
