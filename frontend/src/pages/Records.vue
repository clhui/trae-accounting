<template>
  <div class="records">
    <!-- 顶部导航 -->
    <van-nav-bar 
      title="全部记录" 
      left-arrow 
      @click-left="handleBack"
      fixed
    >
      <template #right>
        <van-icon name="search" @click="showSearch = true" />
      </template>
    </van-nav-bar>

    <div class="records-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <van-dropdown-menu>
          <van-dropdown-item 
            v-model="filterType" 
            :options="typeOptions"
            @change="onFilterChange"
          />
          <van-dropdown-item 
            v-model="filterCategory" 
            :options="categoryOptions"
            @change="onFilterChange"
          />
          <van-dropdown-item 
            v-model="filterAccount" 
            :options="accountOptions"
            @change="onFilterChange"
          />
          <van-dropdown-item 
            v-model="sortBy" 
            :options="sortOptions"
            @change="onSortChange"
          />
        </van-dropdown-menu>
      </div>

      <!-- 搜索状态显示 -->
      <div v-if="searchQuery" class="search-status">
        <div class="search-info">
          <van-icon name="search" />
          <span class="search-text">搜索: "{{ searchQuery }}"</span>
          <van-icon name="cross" @click="clearSearch" class="clear-btn" />
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">+{{ formatAmount(totalIncome) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">-{{ formatAmount(totalExpense) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">净收入</span>
          <span class="stat-value" :class="netIncome >= 0 ? 'income' : 'expense'">
            {{ netIncome >= 0 ? '+' : '' }}{{ formatAmount(netIncome) }}
          </span>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="records-list">
        <div v-if="loading" class="loading">
          <van-loading size="24px">加载中...</van-loading>
        </div>
        
        <div v-else-if="filteredRecords.length === 0" class="empty">
          <van-empty description="暂无记录" />
        </div>
        
        <div v-else>
          <!-- 按日期分组显示 -->
          <div v-for="(group, date) in groupedRecords" :key="date" class="date-group">
            <div class="date-header">
              <span class="date-text">{{ formatDate(date) }}</span>
              <span class="date-summary">
                收入 {{ formatAmount(group.income) }} | 支出 {{ formatAmount(group.expense) }}
              </span>
            </div>
            <div class="record-items">
              <RecordItem
                v-for="record in group.records"
                :key="record.id"
                :record="record"
                @click="viewRecord(record)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top">
      <div class="search-container">
        <van-search
          v-model="searchQuery"
          placeholder="搜索记录备注或分类"
          show-action
          @search="onSearch"
          @cancel="showSearch = false"
          @clear="onSearchClear"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  DropdownMenu as VanDropdownMenu,
  DropdownItem as VanDropdownItem,
  Loading as VanLoading,
  Empty as VanEmpty,
  Popup as VanPopup,
  Search as VanSearch
} from 'vant'
import { useRecordStore } from '../stores/recordStore'
import { formatAmount, formatDate } from '../utils'
import RecordItem from '../components/RecordItem.vue'
import type { Record } from '../types'

const router = useRouter()
const recordStore = useRecordStore()

// 响应式数据
const loading = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')

// 筛选条件
const filterType = ref('all')
const filterCategory = ref('all')
const filterAccount = ref('all')
const sortBy = ref('date-desc')

// 筛选选项
const typeOptions = [
  { text: '类型', value: 'all' },
  { text: '收入', value: 'income' },
  { text: '支出', value: 'expense' }
]

const categoryOptions = computed(() => {
  const options = [{ text: '分类', value: 'all' }]
  recordStore.categories.forEach(category => {
    options.push({
      text: category.name,
      value: category.id
    })
  })
  return options
})

const accountOptions = computed(() => {
  const options = [{ text: '账户', value: 'all' }]
  recordStore.accounts.forEach(account => {
    options.push({
      text: account.name,
      value: account.id
    })
  })
  return options
})

const sortOptions = [
  { text: '排序', value: 'date-desc' },
  { text: '日期↓', value: 'date-desc' },
  { text: '日期↑', value: 'date-asc' },
  { text: '金额↓', value: 'amount-desc' },
  { text: '金额↑', value: 'amount-asc' }
]

// 计算属性
const filteredRecords = computed(() => {
  let records = [...recordStore.records]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    records = records.filter(record => {
      const category = recordStore.categories.find(c => c.id === record.categoryId)
      return (
        record.note?.toLowerCase().includes(query) ||
        category?.name.toLowerCase().includes(query)
      )
    })
  }
  
  // 类型过滤
  if (filterType.value !== 'all') {
    records = records.filter(record => record.type === filterType.value)
  }
  
  // 分类过滤
  if (filterCategory.value !== 'all') {
    records = records.filter(record => record.categoryId === filterCategory.value)
  }
  
  // 账户过滤
  if (filterAccount.value !== 'all') {
    records = records.filter(record => record.accountId === filterAccount.value)
  }
  
  // 排序
  records.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'amount-desc':
        return b.amount - a.amount
      case 'amount-asc':
        return a.amount - b.amount
      default:
        return 0
    }
  })
  
  return records
})

// 按日期分组的记录
const groupedRecords = computed(() => {
  const groups: Record<string, {
    records: Record[]
    income: number
    expense: number
  }> = {}
  
  filteredRecords.value.forEach(record => {
    const date = record.date.split('T')[0] // 获取日期部分
    
    if (!groups[date]) {
      groups[date] = {
        records: [],
        income: 0,
        expense: 0
      }
    }
    
    groups[date].records.push(record)
    
    if (record.type === 'income') {
      groups[date].income += record.amount
    } else {
      groups[date].expense += record.amount
    }
  })
  
  return groups
})

// 统计数据
const totalIncome = computed(() => {
  return filteredRecords.value
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0)
})

const totalExpense = computed(() => {
  return filteredRecords.value
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0)
})

const netIncome = computed(() => {
  return totalIncome.value - totalExpense.value
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      recordStore.loadRecords(),
      recordStore.loadCategories(),
      recordStore.loadAccounts()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => {
  // 筛选条件改变时的处理
}

const onSortChange = () => {
  // 排序条件改变时的处理
}

const onSearch = () => {
  showSearch.value = false
}

const onSearchClear = () => {
  searchQuery.value = ''
}

const clearSearch = () => {
  searchQuery.value = ''
}

const viewRecord = (record: Record) => {
  router.push(`/record/${record.id}`)
}

const handleBack = () => {
  // 检查是否有历史记录可以返回
  if (window.history.length > 1) {
    router.back()
  } else {
    // 没有历史记录时跳转到首页
    router.push('/home')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.records {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.records-content {
  padding: 20px 0 16px;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  margin-bottom: 12px;
}

.filter-bar :deep(.van-dropdown-menu) {
  box-shadow: none;
}

.filter-bar :deep(.van-dropdown-menu__bar) {
  padding: 0 16px;
  height: 44px;
}

/* 搜索状态显示 */
.search-status {
  margin: 0 16px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px 16px;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
}

.search-text {
  flex: 1;
  font-size: 14px;
}

.clear-btn {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: rgba(24, 144, 255, 0.1);
}

/* 统计信息 */
.stats-summary {
  display: flex;
  background: white;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 8px;
  margin: 0 16px 12px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
}

.stat-value.income {
  color: #52c41a;
}

.stat-value.expense {
  color: #ff4d4f;
}

/* 记录列表 */
.records-list {
  padding: 0 16px;
}

.loading,
.empty {
  padding: 40px 16px;
  text-align: center;
}

.date-group {
  margin-bottom: 16px;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.date-summary {
  font-size: 12px;
  color: #666;
}

.record-items {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* 搜索容器 */
.search-container {
  padding: 8px;
  background: white;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .stats-summary {
    margin: 0 12px 12px;
    padding: 12px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .records-list {
    padding: 0 12px;
  }
}
</style>