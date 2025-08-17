<template>
  <div class="home">
    <!-- 顶部导航 -->
    <van-nav-bar title="记账本" fixed>
      <template #right>
        <van-icon name="search" size="18" @click="showSearch = true" />
      </template>
    </van-nav-bar>

    <div class="home-content">
      <!-- 月度统计卡片 -->
      <div class="stats-card">
        <div class="stats-header">
          <span class="stats-month">{{ formatDateRange() }}</span>
          <van-icon name="arrow-down" size="14" @click="showMonthPicker = true" />
        </div>
        
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-label">支出</div>
            <div class="stat-value expense">{{ formatAmount(monthlyStats?.totalExpense || 0) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">收入</div>
            <div class="stat-value income">{{ formatAmount(monthlyStats?.totalIncome || 0) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">结余</div>
            <div class="stat-value balance" :class="{ negative: balance < 0 }">
              {{ formatAmount(balance) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <div class="action-item" @click="quickAdd('expense')">
          <div class="action-icon expense">
            <van-icon name="minus" />
          </div>
          <span>支出</span>
        </div>
        <div class="action-item" @click="quickAdd('income')">
          <div class="action-icon income">
            <van-icon name="plus" />
          </div>
          <span>收入</span>
        </div>
        <div class="action-item" @click="$router.push('/statistics')">
          <div class="action-icon stats">
            <van-icon name="bar-chart-o" />
          </div>
          <span>统计</span>
        </div>
        <div class="action-item" @click="$router.push('/settings')">
          <div class="action-icon settings">
            <van-icon name="setting-o" />
          </div>
          <span>设置</span>
        </div>
      </div>

      <!-- 最近记录 -->
      <div class="recent-records">
        <div class="section-header">
          <span class="section-title">最近记录</span>
          <span class="section-more" @click="$router.push('/records')">查看全部</span>
        </div>
        

        
        <div v-if="loading" class="loading">
          <van-loading size="24px">加载中...</van-loading>
        </div>
        
        <div v-else-if="records.length === 0" class="empty">
          <van-empty description="暂无记录" />
        </div>
        
        <div v-else class="record-list">
          <RecordItem
            v-for="record in records"
            :key="record.id"
            :record="record"
            @click="viewRecord(record)"
          />
        </div>
      </div>
    </div>

    <!-- 月份选择器 -->
    <van-popup v-model:show="showMonthPicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        type="year-month"
        title="选择月份"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
      />
    </van-popup>

    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top">
      <div class="search-container">
        <van-search
          v-model="searchQuery"
          placeholder="搜索记录"
          show-action
          @search="onSearch"
          @cancel="showSearch = false"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRecordStore } from '../stores/recordStore'
import { useAuthStore } from '../stores/authStore'
import { DatabaseService } from '../services/database'
import { formatAmount } from '../utils'
import RecordItem from '../components/RecordItem.vue'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Popup as VanPopup,
  DatePicker as VanDatePicker,
  Search as VanSearch,
  Loading as VanLoading,
  Empty as VanEmpty
} from 'vant'
import type { Record } from '../types'

const router = useRouter()
const recordStore = useRecordStore()
const authStore = useAuthStore()

// 响应式数据
const showMonthPicker = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const now = new Date()
const selectedDate = ref([now.getFullYear(), now.getMonth() + 1])

// 计算属性
const currentMonth = computed(() => {
  if (Array.isArray(selectedDate.value) && selectedDate.value.length >= 2) {
    return selectedDate.value[1]
  }
  return new Date().getMonth() + 1
})

const formatDateRange = () => {
  if (Array.isArray(selectedDate.value) && selectedDate.value.length >= 2) {
    const year = selectedDate.value[0]
    const month = selectedDate.value[1]
    return `${year}年${month}月`
  }
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
}
const balance = computed(() => 
  (recordStore.monthlyStats?.totalIncome || 0) - (recordStore.monthlyStats?.totalExpense || 0)
)

// 从store获取数据（保持响应性）
const { records, monthlyStats, loading } = storeToRefs(recordStore)

// 生命周期
onMounted(async () => {
  // 确保用户有默认数据
  if (authStore.user?.id) {
    await DatabaseService.ensureUserDefaultData(authStore.user.id)
  }
  
  // 加载基础数据
  await recordStore.loadCategories()
  await recordStore.loadAccounts()
  
  // 加载最近记录
  await recordStore.loadRecords({ limit: 10 })
  
  // 加载当月统计
  const now = new Date()
  await recordStore.loadMonthlyStats(now.getFullYear(), now.getMonth() + 1)
})

// 方法
const quickAdd = (type: 'income' | 'expense') => {
  router.push({
    path: '/add-record',
    query: { type }
  })
}

const viewRecord = (record: Record) => {
  router.push(`/record/${record.id}`)
}

const onMonthConfirm = (value: any) => {
  let selectedValues: number[]
  if (Array.isArray(value)) {
    selectedValues = value
  } else if (value && Array.isArray(value.selectedValues)) {
    selectedValues = value.selectedValues
  } else {
    return
  }
  
  selectedDate.value = selectedValues
  showMonthPicker.value = false
  
  // 重新加载选中月份的统计数据
  const [year, month] = selectedValues
  recordStore.loadMonthlyStats(year, month)
}

const onSearch = (query: string) => {
  if (query.trim()) {
    router.push({
      path: '/records',
      query: { search: query }
    })
  }
  showSearch.value = false
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.home-content {
  padding: 46px 16px 16px;
}

/* 统计卡片 */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.stats-month {
  font-size: 18px;
  font-weight: 600;
  margin-right: 8px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-value.expense {
  color: #ff6b6b;
}

.stat-value.income {
  color: #51cf66;
}

.stat-value.balance.negative {
  color: #ff6b6b;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 8px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: white;
  font-size: 20px;
}

.action-icon.expense {
  background: #ff6b6b;
}

.action-icon.income {
  background: #51cf66;
}

.action-icon.stats {
  background: #4ecdc4;
}

.action-icon.settings {
  background: #feca57;
}

.action-item span {
  font-size: 12px;
  color: #666;
}

/* 最近记录 */
.recent-records {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
}

.loading,
.empty {
  padding: 40px 16px;
  text-align: center;
}

.record-list {
  padding: 8px 0;
}

/* 搜索容器 */
.search-container {
  padding: 8px;
  background: white;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .home-content {
    padding: 46px 12px 12px;
  }
  
  .stats-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .action-icon {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
}
</style>