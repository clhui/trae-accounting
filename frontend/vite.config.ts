import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // 强制更新缓存策略
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css|html)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Trae记账本',
        short_name: '记账本',
        description: '简单易用的个人记账应用',
        theme_color: '#1890ff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    // 启用文件名哈希，防止浏览器缓存问题
    assetsInlineLimit: 0, // 禁用内联资源，确保所有资源都有独立的哈希文件名
    rollupOptions: {
      output: {
        // 确保每次构建时文件名都包含哈希值，使用更强的哈希策略
        entryFileNames: (chunkInfo) => {
          const timestamp = Date.now()
          return `assets/[name]-[hash]-${timestamp}.js`
        },
        chunkFileNames: (chunkInfo) => {
          const timestamp = Date.now()
          return `assets/[name]-[hash]-${timestamp}.js`
        },
        assetFileNames: (assetInfo) => {
          const timestamp = Date.now()
          return `assets/[name]-[hash]-${timestamp}.[ext]`
        }
      }
    },
    // 启用源码映射以便调试
    sourcemap: false,
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000
  }
})