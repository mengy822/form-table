// docs/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools()  // 添加 Vue DevTools 插件
  ],
  resolve: {
    alias: {
      // 确保 ftv3 指向正确位置
      'ftv3': path.resolve(__dirname, '../packages/index.ts'),
    }
  },
  optimizeDeps: {
    // 强制预构建本地包
    include: ['ftv3', 'element-plus'],
    // 排除不需要预构建的
    exclude: []
  },
  server: {
    allowedHosts: ['vsweb.whtb.qzz.io'],
    port: 80,
    host: '0.0.0.0',  // 强制使用 IPv4
    open: false,
    // 允许访问父目录
    fs: {
      allow: ['..', '../packages']
    },
    // 监听 packages 目录变化
    watch: {
      usePolling: true,
      interval: 1000,
    }
  },
  // 处理 TypeScript 文件
  esbuild: {
    loader: 'ts',
    include: /\.(ts|js|tsx|jsx)$/,
    exclude: [],
  },
  // 添加 devtool 配置
  build: {
    sourcemap: true,  // 启用 source map
  }
})
