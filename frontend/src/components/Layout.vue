<template>
  <div class="layout">
    <!-- 顶部用户信息栏 -->
    <div class="user-header">
      <div class="user-info">
        <van-icon name="contact" class="user-avatar" />
        <span class="username">{{ authStore.user?.username }}</span>
      </div>
      <van-button 
        type="primary" 
        size="small" 
        plain 
        @click="handleLogout"
        class="logout-btn"
      >
        退出
      </van-button>
    </div>
    
    <div class="layout-content">
      <router-view />
    </div>
    
    <van-tabbar v-model="activeTab" @change="onTabChange" fixed>
      <van-tabbar-item name="home" icon="home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item name="add-record" icon="plus">
        记账
      </van-tabbar-item>
      <van-tabbar-item name="statistics" icon="bar-chart-o">
        统计
      </van-tabbar-item>
      <van-tabbar-item name="settings" icon="setting-o">
        设置
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Tabbar as VanTabbar, 
  TabbarItem as VanTabbarItem,
  Icon as VanIcon,
  Button as VanButton,
  showConfirmDialog
} from 'vant'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref('home')

// 监听路由变化，更新活跃标签
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/home') {
      activeTab.value = 'home'
    } else if (newPath === '/add-record') {
      activeTab.value = 'add-record'
    } else if (newPath === '/statistics') {
      activeTab.value = 'statistics'
    } else if (newPath === '/settings') {
      activeTab.value = 'settings'
    }
  },
  { immediate: true }
)

const onTabChange = (name: string) => {
  const routeMap: Record<string, string> = {
    'home': '/home',
    'add-record': '/add-record',
    'statistics': '/statistics',
    'settings': '/settings'
  }
  
  const path = routeMap[name]
  if (path && route.path !== path) {
    router.push(path)
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await authStore.logout()
    router.replace('/login')
  } catch (error) {
    // 用户取消退出，不做任何操作
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 用户信息栏样式 */
.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  font-size: 20px;
  color: white;
}

.username {
  font-size: 16px;
  font-weight: 500;
}

.logout-btn {
  border-color: rgba(255, 255, 255, 0.6);
  color: white;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px; /* 为底部导航栏留出空间 */
}

/* 自定义tabbar样式 */
:deep(.van-tabbar) {
  background-color: #fff;
  border-top: 1px solid #ebedf0;
}

:deep(.van-tabbar-item) {
  color: #969799;
}

:deep(.van-tabbar-item--active) {
  color: #1890ff;
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
  margin-bottom: 4px;
}

:deep(.van-tabbar-item__text) {
  font-size: 12px;
}
</style>