<template>
  <div class="cloud-test-page">
    <van-nav-bar title="云数据库测试" left-arrow @click-left="$router.back()" />
    
    <!-- 连接状态 -->
    <van-cell-group title="连接状态">
      <van-cell title="网络状态" :value="networkStatus.isOnline ? '在线' : '离线'" />
      <van-cell title="云端连接" :value="networkStatus.isSupabaseConnected ? '已连接' : '未连接'" />
      <van-cell title="存储模式" :value="storageMode" />
      <van-cell title="最后同步" :value="lastSyncTime || '从未同步'" />
    </van-cell-group>

    <!-- 用户认证 -->
    <van-cell-group title="用户认证">
      <van-cell v-if="!currentUser" title="登录状态" value="未登录" />
      <van-cell v-else title="当前用户" :value="currentUser.username" />
      
      <div v-if="!currentUser" class="auth-section">
        <van-form @submit="handleLogin">
          <van-field
            v-model="loginForm.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[{ required: true, message: '请输入邮箱' }]"
          />
          <van-field
            v-model="loginForm.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
          <div class="auth-buttons">
            <van-button round block type="primary" native-type="submit" :loading="authLoading">
              登录
            </van-button>
            <van-button round block plain type="primary" @click="showRegister = true">
              注册
            </van-button>
          </div>
        </van-form>
      </div>
      
      <div v-else class="auth-section">
        <van-button round block type="danger" @click="handleLogout" :loading="authLoading">
          退出登录
        </van-button>
      </div>
    </van-cell-group>

    <!-- 数据同步 -->
    <van-cell-group v-if="currentUser" title="数据同步">
      <van-cell title="待同步操作" :value="offlineStatus.pendingOperations + ' 条'" />
      <van-cell title="队列大小" :value="offlineStatus.queueSize + ' 条'" />
      
      <div class="sync-section">
        <van-button round block type="primary" @click="handleSync" :loading="syncLoading">
          手动同步
        </van-button>
        <van-button round block plain type="warning" @click="handleClearQueue">
          清空队列
        </van-button>
      </div>
    </van-cell-group>

    <!-- 测试操作 -->
    <van-cell-group v-if="currentUser" title="测试操作">
      <div class="test-section">
        <van-button round block type="success" @click="handleAddTestRecord" :loading="testLoading">
          添加测试记录
        </van-button>
        <van-button round block plain type="success" @click="handleLoadRecords">
          加载记录列表
        </van-button>
        <van-button round block plain type="info" @click="handleExportData">
          导出数据
        </van-button>
      </div>
    </van-cell-group>

    <!-- 测试结果 -->
    <van-cell-group v-if="testResults.length > 0" title="测试结果">
      <van-cell
        v-for="(result, index) in testResults"
        :key="index"
        :title="result.operation"
        :value="result.status"
        :label="result.message"
      />
    </van-cell-group>

    <!-- 记录列表 -->
    <van-cell-group v-if="records.length > 0" title="记录列表">
      <van-cell
        v-for="record in records.slice(0, 5)"
        :key="record.id"
        :title="record.description || '无描述'"
        :value="`${record.type === 'income' ? '+' : '-'}${record.amount}`"
        :label="record.date"
      />
      <van-cell v-if="records.length > 5" title="..." :value="`共 ${records.length} 条记录`" />
    </van-cell-group>

    <!-- 注册弹窗 -->
    <van-popup v-model:show="showRegister" position="bottom" :style="{ height: '60%' }">
      <van-nav-bar title="用户注册" left-text="取消" @click-left="showRegister = false" />
      <van-form @submit="handleRegister" class="register-form">
        <van-field
          v-model="registerForm.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="registerForm.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }]"
        />
        <van-field
          v-model="registerForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <div class="register-buttons">
          <van-button round block type="primary" native-type="submit" :loading="authLoading">
            注册
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { AuthService } from '../services/auth'
import { HybridDatabaseService } from '../services/hybridDatabase'
import { OfflineService } from '../services/offline'
import { getNetworkStatus, initializeNetworkMonitoring, addConnectionStatusListener } from '../services/supabase'
import type { User, Record } from '../types'

// 响应式数据
const currentUser = ref<User | null>(null)
const networkStatus = ref(getNetworkStatus())
const storageMode = ref('hybrid')
const lastSyncTime = ref<string | null>(null)
const offlineStatus = ref(OfflineService.getOfflineStatus())

// 表单数据
const loginForm = reactive({
  email: 'test@example.com',
  password: 'password123'
})

const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

// 状态
const showRegister = ref(false)
const authLoading = ref(false)
const syncLoading = ref(false)
const testLoading = ref(false)

// 测试数据
const testResults = ref<Array<{
  operation: string
  status: string
  message: string
  timestamp: Date
}>>([])

const records = ref<Record[]>([])

// 连接状态监听器
let removeConnectionListener: (() => void) | null = null

// 组件挂载
onMounted(async () => {
  try {
    // 初始化服务
    await AuthService.initialize()
    await HybridDatabaseService.initialize()
    await OfflineService.initialize()
    initializeNetworkMonitoring()

    // 获取当前用户
    currentUser.value = AuthService.getCurrentUser()
    
    // 更新状态
    updateStatus()
    
    // 监听连接状态变化
    removeConnectionListener = addConnectionStatusListener((status) => {
      networkStatus.value = {
        ...networkStatus.value,
        ...status
      }
      updateStatus()
    })

    // 监听认证状态变化
    AuthService.addAuthListener((user) => {
      currentUser.value = user
      updateStatus()
    })

    addTestResult('初始化', '成功', '所有服务初始化完成')
  } catch (error) {
    console.error('初始化失败:', error)
    addTestResult('初始化', '失败', error instanceof Error ? error.message : '初始化失败')
  }
})

// 组件卸载
onUnmounted(() => {
  if (removeConnectionListener) {
    removeConnectionListener()
  }
})

// 更新状态
function updateStatus() {
  networkStatus.value = getNetworkStatus()
  storageMode.value = HybridDatabaseService.getCurrentMode()
  const syncTime = HybridDatabaseService.getLastSyncTime()
  lastSyncTime.value = syncTime ? syncTime.toLocaleString() : null
  offlineStatus.value = OfflineService.getOfflineStatus()
}

// 添加测试结果
function addTestResult(operation: string, status: string, message: string) {
  testResults.value.unshift({
    operation,
    status,
    message,
    timestamp: new Date()
  })
  
  // 限制结果数量
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10)
  }
}

// 处理登录
async function handleLogin() {
  authLoading.value = true
  try {
    const { user, error } = await AuthService.login(loginForm)
    
    if (error) {
      showToast(error)
      addTestResult('登录', '失败', error)
    } else if (user) {
      showToast('登录成功')
      addTestResult('登录', '成功', `用户 ${user.username} 登录成功`)
      currentUser.value = user
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    showToast(message)
    addTestResult('登录', '失败', message)
  } finally {
    authLoading.value = false
  }
}

// 处理注册
async function handleRegister() {
  authLoading.value = true
  try {
    const { user, error } = await AuthService.register(registerForm)
    
    if (error) {
      showToast(error)
      addTestResult('注册', '失败', error)
    } else if (user) {
      showToast('注册成功')
      addTestResult('注册', '成功', `用户 ${user.username} 注册成功`)
      showRegister.value = false
      currentUser.value = user
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败'
    showToast(message)
    addTestResult('注册', '失败', message)
  } finally {
    authLoading.value = false
  }
}

// 处理登出
async function handleLogout() {
  authLoading.value = true
  try {
    const { error } = await AuthService.logout()
    
    if (error) {
      showToast(error)
      addTestResult('登出', '失败', error)
    } else {
      showToast('已退出登录')
      addTestResult('登出', '成功', '用户已退出登录')
      currentUser.value = null
      records.value = []
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '登出失败'
    showToast(message)
    addTestResult('登出', '失败', message)
  } finally {
    authLoading.value = false
  }
}

// 处理数据同步
async function handleSync() {
  if (!currentUser.value) {
    showToast('请先登录')
    return
  }

  syncLoading.value = true
  try {
    const result = await HybridDatabaseService.syncData(currentUser.value.id)
    
    if (result.success) {
      showToast('同步成功')
      addTestResult('数据同步', '成功', result.message)
    } else {
      showToast('同步失败')
      addTestResult('数据同步', '失败', result.message)
    }
    
    updateStatus()
  } catch (error) {
    const message = error instanceof Error ? error.message : '同步失败'
    showToast(message)
    addTestResult('数据同步', '失败', message)
  } finally {
    syncLoading.value = false
  }
}

// 清空离线队列
async function handleClearQueue() {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '确定要清空离线操作队列吗？'
    })
    
    await OfflineService.clearQueue()
    showToast('队列已清空')
    addTestResult('清空队列', '成功', '离线操作队列已清空')
    updateStatus()
  } catch (error) {
    // 用户取消
  }
}

// 添加测试记录
async function handleAddTestRecord() {
  if (!currentUser.value) {
    showToast('请先登录')
    return
  }

  testLoading.value = true
  try {
    const testRecord = {
      type: 'expense' as const,
      amount: Math.floor(Math.random() * 1000) + 1,
      categoryId: 'test-category',
      accountId: 'test-account',
      date: new Date().toISOString().split('T')[0],
      description: `测试记录 ${new Date().toLocaleTimeString()}`
    }

    const recordId = await HybridDatabaseService.addRecord(testRecord, currentUser.value.id)
    showToast('测试记录添加成功')
    addTestResult('添加记录', '成功', `记录ID: ${recordId}`)
    
    // 刷新记录列表
    await handleLoadRecords()
  } catch (error) {
    const message = error instanceof Error ? error.message : '添加记录失败'
    showToast(message)
    addTestResult('添加记录', '失败', message)
  } finally {
    testLoading.value = false
  }
}

// 加载记录列表
async function handleLoadRecords() {
  if (!currentUser.value) {
    showToast('请先登录')
    return
  }

  try {
    const loadedRecords = await HybridDatabaseService.getRecords(currentUser.value.id, { limit: 10 })
    records.value = loadedRecords
    addTestResult('加载记录', '成功', `加载了 ${loadedRecords.length} 条记录`)
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载记录失败'
    showToast(message)
    addTestResult('加载记录', '失败', message)
  }
}

// 导出数据
async function handleExportData() {
  if (!currentUser.value) {
    showToast('请先登录')
    return
  }

  try {
    const exportData = await HybridDatabaseService.exportData(currentUser.value.id)
    console.log('导出数据:', exportData)
    showToast('数据导出成功，请查看控制台')
    addTestResult('导出数据', '成功', '数据已导出到控制台')
  } catch (error) {
    const message = error instanceof Error ? error.message : '导出数据失败'
    showToast(message)
    addTestResult('导出数据', '失败', message)
  }
}
</script>

<style scoped>
.cloud-test-page {
  padding-bottom: 20px;
}

.auth-section,
.sync-section,
.test-section {
  padding: 16px;
}

.auth-buttons,
.register-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.register-form {
  padding: 16px;
}

.van-cell__value {
  color: var(--van-text-color);
}

.van-cell__label {
  color: var(--van-text-color-2);
}
</style>