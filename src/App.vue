<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecordStore } from './stores/recordStore'
import { initDatabase } from './utils/database'

const recordStore = useRecordStore()

// 初始化数据库
onMounted(async () => {
  try {
    await initDatabase()
    // 加载初始数据
    await recordStore.loadCategories()
    await recordStore.loadAccounts()
  } catch (error) {
    console.error('初始化失败:', error)
  }
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}
</style>