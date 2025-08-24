<template>
  <div class="statistics">
    <!-- 顶部导航 -->
    <van-nav-bar title="统计" fixed>
      <template #right>
        <van-icon name="calendar-o" size="18" @click="showDatePicker = true" />
      </template>
    </van-nav-bar>

    <div class="statistics-content">
      <!-- 日期选择 -->
      <div class="date-selector">
        <div class="date-display" @click="showDatePicker = true">
          <span class="date-text">{{ formatDateRange() }}</span>
          <van-icon name="arrow-down" size="14" />
        </div>
      </div>
      

      <!-- 概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card expense">
          <div class="card-label">总支出</div>
          <div class="card-value">{{ formatAmount(totalExpense) }}</div>
          <div class="card-count">{{ expenseCount }}笔</div>
        </div>
        
        <div class="overview-card income">
          <div class="card-label">总收入</div>
          <div class="card-value">{{ formatAmount(totalIncome) }}</div>
          <div class="card-count">{{ incomeCount }}笔</div>
        </div>
        
        <div class="overview-card balance">
          <div class="card-label">结余</div>
          <div class="card-value" :class="{ negative: balance < 0 }">
            {{ formatAmount(balance) }}
          </div>
          <div class="card-count">{{ totalCount }}笔</div>
        </div>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky>
        <!-- 分类统计 -->
        <van-tab title="分类统计" name="category">
          <div class="tab-content">
            <!-- 类型切换 -->
            <van-radio-group v-model="statsType" direction="horizontal" class="type-selector">
              <van-radio name="expense">支出</van-radio>
              <van-radio name="income">收入</van-radio>
            </van-radio-group>

            <!-- 分类统计列表 -->
            <div v-if="loading" class="loading">
              <van-loading size="24px">加载中...</van-loading>
            </div>
            

            
            <div v-if="!loading && categoryStats.length === 0" class="empty">
              <van-empty description="暂无数据" />
            </div>
            
            <div v-else class="category-stats">
              <div 
                v-for="stat in categoryStats" 
                :key="stat.categoryId"
                class="category-stat-item"
                @click="viewCategoryDetail(stat)"
              >
                <div class="stat-left">
                  <div class="category-icon" :style="{ backgroundColor: getCategoryColor(stat.categoryId) }">
                    <van-icon :name="getCategoryIcon(stat.categoryId)" />
                  </div>
                  <div class="stat-info">
                    <div class="category-name">{{ getCategoryName(stat.categoryId) }}</div>
                    <div class="stat-details">
                      <span class="stat-count">{{ stat.count }}笔</span>
                      <span class="stat-percent">{{ calculatePercent(stat.amount) }}%</span>
                    </div>
                  </div>
                </div>
                
                <div class="stat-right">
                  <div class="stat-amount">{{ formatAmount(stat.amount) }}</div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: calculatePercent(stat.amount) + '%',
                        backgroundColor: getCategoryColor(stat.categoryId)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 趋势分析 -->
        <van-tab title="趋势分析" name="trend">
          <div class="tab-content">
            <!-- 图表容器 -->
            <div class="chart-container">
              <div class="chart-content">
                <div class="chart-header">
                  <h3>收支趋势分析</h3>
                </div>
                <div ref="chartRef" class="echarts-container"></div>
              </div>
            </div>
            
            <!-- 趋势数据 -->
            <div class="trend-data">
              <div class="trend-item">
                <div class="trend-label">日均支出</div>
                <div class="trend-value">{{ formatAmount(dailyAverage.expense) }}</div>
              </div>
              <div class="trend-item">
                <div class="trend-label">日均收入</div>
                <div class="trend-value">{{ formatAmount(dailyAverage.income) }}</div>
              </div>
              <div class="trend-item">
                <div class="trend-label">最大单笔支出</div>
                <div class="trend-value">{{ formatAmount(maxTransaction.expense) }}</div>
              </div>
              <div class="trend-item">
                <div class="trend-label">最大单笔收入</div>
                <div class="trend-value">{{ formatAmount(maxTransaction.income) }}</div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 账户统计 -->
        <van-tab title="账户统计" name="account">
          <div class="tab-content">
            <div v-if="loading" class="loading">
              <van-loading size="24px">加载中...</van-loading>
            </div>
            
            <div v-if="!loading && recordStore.accountStats.length === 0" class="empty">
              <van-empty description="暂无数据" />
            </div>
            
            <div v-else class="account-stats">
              <div 
                v-for="stat in recordStore.accountStats" 
                :key="stat.accountId"
                class="account-stat-item"
              >
                <div class="account-info">
                  <div class="account-name">{{ stat.accountName }}</div>
                  <div class="account-type">{{ getAccountTypeText(stat.accountType) }}</div>
                  <div class="account-count">{{ stat.count }} 笔交易</div>
                </div>
                <div class="account-amounts">
                  <div class="amount-item income">
                    <span class="label">收入</span>
                    <span class="value">{{ formatAmount(stat.income) }}</span>
                  </div>
                  <div class="amount-item expense">
                    <span class="label">支出</span>
                    <span class="value">{{ formatAmount(stat.expense) }}</span>
                  </div>
                  <div class="amount-item balance" :class="{ negative: stat.balance < 0 }">
                    <span class="label">净额</span>
                    <span class="value">{{ formatAmount(stat.balance) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-calendar
        v-model:show="showDatePicker"
        type="range"
        title="选择日期区间"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date()"
        @confirm="onDateRangeConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch, nextTick } from 'vue'
import { useRecordStore } from '../stores/recordStore'
import { formatAmount } from '../utils'
import { DatabaseService } from '../services/database'
import * as echarts from 'echarts'
import { showConfirmDialog, showSuccessToast } from 'vant'
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Tabs as VanTabs,
  Tab as VanTab,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  Loading as VanLoading,
  Empty as VanEmpty,
  Popup as VanPopup,
  Calendar as VanCalendar
} from 'vant'

const recordStore = useRecordStore()

// 响应式数据
const activeTab = ref('category')
const statsType = ref<'income' | 'expense'>('expense')
const showDatePicker = ref(false)
const selectedDateRange = ref([
  new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 本月第一天
  new Date() // 今天
])
const loading = ref(false)

// ECharts 相关
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 计算属性 - 根据选定日期区间过滤记录
const filteredRecords = computed(() => {
  const startDate = selectedDateRange.value[0].toISOString().split('T')[0]
  const endDate = selectedDateRange.value[1].toISOString().split('T')[0]
  
  return recordStore.records.filter(record => {
    return record.date >= startDate && record.date <= endDate
  })
})

const balance = computed(() => {
  const totalIncome = filteredRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  
  const totalExpense = filteredRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
  
  return totalIncome - totalExpense
})

const totalCount = computed(() => filteredRecords.value.length)

const totalIncome = computed(() => 
  filteredRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
)

const totalExpense = computed(() => 
  filteredRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
)

const incomeCount = computed(() => 
  filteredRecords.value.filter(r => r.type === 'income').length
)

const expenseCount = computed(() => 
  filteredRecords.value.filter(r => r.type === 'expense').length
)

const categoryStats = computed(() => {
  return recordStore.categoryStats
    .filter(stat => stat.type === statsType.value)
    .sort((a, b) => b.amount - a.amount)
})

const totalAmount = computed(() => {
  return categoryStats.value.reduce((sum, stat) => sum + stat.amount, 0)
})

const dailyAverage = computed(() => {
  const startDate = selectedDateRange.value[0]
  const endDate = selectedDateRange.value[1]
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  const totalExpense = filteredRecords.value
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
  
  const totalIncome = filteredRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  
  return {
    expense: totalExpense / daysDiff,
    income: totalIncome / daysDiff
  }
})

const maxTransaction = computed(() => {
  // 从当前日期区间的记录中计算最大交易金额
  const expenseRecords = filteredRecords.value.filter(r => r.type === 'expense')
  const incomeRecords = filteredRecords.value.filter(r => r.type === 'income')
  
  return {
    expense: expenseRecords.length > 0 ? Math.max(...expenseRecords.map(r => r.amount)) : 0,
    income: incomeRecords.length > 0 ? Math.max(...incomeRecords.map(r => r.amount)) : 0
  }
})

// 直接使用 recordStore.monthlyStats 保持响应性

// 监听统计类型变化
watch(statsType, () => {
  loadCategoryStats()
})

// 监听日期变化
watch(selectedDateRange, () => {
  loadData()
}, { deep: true })

// 生命周期
onMounted(() => {
  loadData()
})

// 页面激活时重新加载数据（用于keep-alive缓存的页面）
onActivated(() => {
  loadData()
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const startDate = selectedDateRange.value[0]
    const endDate = selectedDateRange.value[1]
    
    await Promise.all([
      recordStore.loadRecords({ startDate, endDate }), // 加载指定日期区间的记录数据
      recordStore.loadAccounts(), // 加载账户数据
      recordStore.loadCategories(), // 加载分类数据
      loadCategoryStats(),
      recordStore.loadAccountStats(startDate, endDate) // 加载账户统计数据
    ])
  } finally {
    loading.value = false
  }
}

const loadCategoryStats = async () => {
  const startDate = selectedDateRange.value[0]
  const endDate = selectedDateRange.value[1]
  
  await recordStore.loadCategoryStats(startDate, endDate, statsType.value)
}

const getAccountTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'cash': '现金',
    'bank': '银行卡',
    'credit': '信用卡',
    'other': '其他'
  }
  return typeMap[type] || '其他'
}

// 格式化日期范围
const formatDateRange = () => {
  const startDate = selectedDateRange.value[0]
  const endDate = selectedDateRange.value[1]
  
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}



// 计算日期区间内的周趋势数据
const monthlyTrendData = computed(() => {
  const startDate = selectedDateRange.value[0]
  const endDate = selectedDateRange.value[1]
  const trendData = []
  
  // 如果没有记录数据，返回空数组
  if (!filteredRecords.value || filteredRecords.value.length === 0) {
    return []
  }
  
  // 计算日期区间的天数
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  // 如果日期区间小于等于7天，按天显示
  if (daysDiff <= 7) {
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const dayRecords = filteredRecords.value.filter(record => {
        const recordDateStr = record.date // 数据库中的日期是字符串格式 YYYY-MM-DD
        const currentDateStr = currentDate.toISOString().split('T')[0] // 转换为 YYYY-MM-DD 格式
        return recordDateStr === currentDateStr
      })
      
      const income = dayRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const expense = dayRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)
      
      trendData.push({
        date: currentDate,
        label: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        income,
        expense
      })
    }
  } else {
    // 如果日期区间大于7天，按周显示（最多显示5周）
    const weekCount = Math.min(Math.ceil(daysDiff / 7), 5)
    
    for (let i = 0; i < weekCount; i++) {
      const weekStartDate = new Date(startDate)
      weekStartDate.setDate(startDate.getDate() + i * 7)
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)
      
      // 确保不超过选定的结束日期
      if (weekEndDate > endDate) {
        weekEndDate.setTime(endDate.getTime())
      }
      
      const weekRecords = filteredRecords.value.filter(record => {
        const recordDateStr = record.date // 数据库中的日期是字符串格式 YYYY-MM-DD
        const weekStartStr = weekStartDate.toISOString().split('T')[0]
        const weekEndStr = weekEndDate.toISOString().split('T')[0]
        return recordDateStr >= weekStartStr && recordDateStr <= weekEndStr
      })
      
      const income = weekRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
      
      const expense = weekRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)
      
      trendData.push({
        startDate: weekStartDate,
        endDate: weekEndDate,
        label: `第${i + 1}周`,
        income,
        expense
      })
    }
  }
  
  return trendData
})

// 监听趋势数据变化，更新图表
watch(monthlyTrendData, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 监听活动标签变化，初始化图表
watch(activeTab, (newTab) => {
  if (newTab === 'trend') {
    nextTick(() => {
      initChart()
    })
  }
})

// 计算柱状图高度百分比（保留原有方法用于其他地方）
const getBarHeight = (amount: number) => {
  const maxAmount = Math.max(
    recordStore.monthlyStats?.totalIncome || 0,
    recordStore.monthlyStats?.totalExpense || 0,
    Math.abs(balance.value)
  )
  if (maxAmount === 0) return 0
  return Math.max((amount / maxAmount) * 80, 5) // 最小高度5%，最大80%
}

const getCategoryName = (categoryId: string) => {
  const category = recordStore.categories.find(c => c.id === categoryId)
  return category?.name || '未知分类'
}

const getCategoryIcon = (categoryId: string) => {
  const category = recordStore.categories.find(c => c.id === categoryId)
  return category?.icon || 'other-o'
}

const getCategoryColor = (categoryId: string) => {
  const category = recordStore.categories.find(c => c.id === categoryId)
  return category?.color || '#c8d6e5'
}

const calculatePercent = (amount: number) => {
  if (totalAmount.value === 0) return 0
  return Math.round((amount / totalAmount.value) * 100)
}

const viewCategoryDetail = (stat: any) => {
  // 跳转到分类详情页面
  console.log('查看分类详情:', stat)
}

const onDateRangeConfirm = (values: [Date, Date]) => {
  selectedDateRange.value = values
  showDatePicker.value = false
}



// ECharts 初始化
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁已存在的实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !monthlyTrendData.value.length) return
  
  const categories = monthlyTrendData.value.map(item => item.label)
  const incomeData = monthlyTrendData.value.map(item => item.income)
  const expenseData = monthlyTrendData.value.map(item => item.expense)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>'
        params.forEach((param: any) => {
          const value = param.value
          const formattedValue = value.toLocaleString('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2
          })
          result += param.marker + param.seriesName + ': ' + formattedValue + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value: number) {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万'
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k'
          }
          return value.toString()
        }
      }
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: incomeData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4ade80' },
            { offset: 1, color: '#22c55e' }
          ])
        },
        barWidth: '30%'
      },
      {
        name: '支出',
        type: 'bar',
        data: expenseData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f87171' },
            { offset: 1, color: '#ef4444' }
          ])
        },
        barWidth: '30%'
      }
    ]
  }
  
  chartInstance.setOption(option)
}
</script>

<style scoped>
.statistics {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.statistics-content {
  padding-top: 20px;
}

/* 日期选择器 */
.date-selector {
  padding: 12px 16px;
  background: white;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 操作按钮容器 */
.action-buttons {
  padding: 8px 16px;
  background: white;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.date-text {
  font-size: 16px;
  font-weight: 500;
  margin-right: 8px;
}



/* 概览卡片 */
.overview-cards {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
}

.overview-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.overview-card.expense {
  border-left: 4px solid #ff6b6b;
}

.overview-card.income {
  border-left: 4px solid #51cf66;
}

.overview-card.balance {
  border-left: 4px solid #4ecdc4;
}

.card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.card-value.negative {
  color: #ff6b6b;
}

.card-count {
  font-size: 11px;
  color: #999;
}

/* 标签页内容 */
.tab-content {
  padding: 16px;
}

.type-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 8px;
}

.type-selector :deep(.van-radio) {
  flex: 1;
  margin: 0;
}

/* 分类统计 */
.category-stats {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.category-stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-stat-item:hover {
  background-color: #f8f9fa;
}

.category-stat-item:last-child {
  border-bottom: none;
}

.stat-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
}

.stat-info {
  flex: 1;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.stat-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.stat-right {
  text-align: right;
  min-width: 100px;
}

.stat-amount {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.progress-bar {
  width: 80px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-left: auto;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

/* 图表容器 */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  margin-bottom: 16px;
}

.chart-content {
  padding: 8px 0;
}

.chart-header {
  text-align: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #323233;
  font-weight: 500;
}

.echarts-container {
  width: 100%;
  height: 300px;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 160px;
  justify-content: flex-end;
  margin: 8px 0;
}

.bar {
  width: 40px;
  min-height: 8px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}



/* 趋势数据 */
.trend-data {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.trend-item:last-child {
  border-bottom: none;
}

.trend-label {
  font-size: 14px;
  color: #666;
}

.trend-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 账户统计 */
.account-stats {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.account-stat-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.account-stat-item:last-child {
  border-bottom: none;
}

.account-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.account-basic {
  flex: 1;
}

.account-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.account-type {
  font-size: 12px;
  color: #999;
}

.account-count {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.account-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.amount-item {
  text-align: center;
}

.amount-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 14px;
  font-weight: 500;
}

.amount-value.income {
  color: #07c160;
}

.amount-value.expense {
  color: #ee0a24;
}

.amount-value.balance {
  color: #333;
}

/* 加载和空状态 */
.loading,
.empty {
  padding: 40px 16px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .overview-cards {
    gap: 8px;
    padding: 0 12px 12px;
  }
  
  .overview-card {
    padding: 12px;
  }
  
  .card-value {
    font-size: 16px;
  }
  
  .tab-content {
    padding: 12px;
  }
  
  .category-stat-item {
    padding: 12px;
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>