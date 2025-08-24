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
            <!-- 类型切换和饼状图按钮 -->
            <div class="category-header">
              <van-radio-group v-model="statsType" direction="horizontal" class="type-selector">
                <van-radio name="expense">支出</van-radio>
                <van-radio name="income">收入</van-radio>
              </van-radio-group>
              <van-button 
                type="primary" 
                size="small" 
                icon="chart-trending-o" 
                @click="showPieChart"
                :disabled="categoryStats.length === 0"
              >
                饼状图
              </van-button>
            </div>

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
                    <span v-if="isEmojiIcon(getCategoryIcon(stat.categoryId))" class="emoji-icon">{{ getCategoryIcon(stat.categoryId) }}</span>
                    <van-icon v-else :name="getCategoryIcon(stat.categoryId)" />
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
                <div class="chart-actions">
                  <div class="chart-type-buttons">
                    <van-button 
                       :type="chartType === 'bar' ? 'primary' : 'default'"
                       size="small" 
                       icon="bar-chart-o"
                       @click="chartType = 'bar'"
                     >
                       柱状
                     </van-button>
                     <van-button 
                       :type="chartType === 'line' ? 'primary' : 'default'"
                       size="small" 
                       icon="chart-trending-o"
                       @click="chartType = 'line'"
                     >
                       折线
                     </van-button>
                  </div>
                  <van-button 
                    type="primary" 
                    size="small" 
                    icon="enlarge" 
                    @click="toggleFullscreen"
                  >
                    {{ isFullscreen ? '退出全屏' : '全屏' }}
                  </van-button>
                </div>
                <div ref="chartRef" class="echarts-container"></div>
                
                <!-- 全屏弹出框 -->
                <van-popup 
                  v-model:show="isFullscreen" 
                  position="center" 
                  :style="{ width: '100vw', height: '100vh' }"
                  closeable
                  close-icon="cross"
                  @closed="onPopupClosed"
                  @opened="onFullscreenOpened"
                  class="landscape-popup"
                >
                  <div class="fullscreen-popup landscape-content">
                    <div class="popup-header">
                      <h3>收支趋势图表</h3>
                    </div>
                    <div ref="fullscreenChartRef" class="fullscreen-chart-container"></div>
                  </div>
                </van-popup>
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

    <!-- 饼状图全屏弹出框 -->
    <van-popup 
      v-model:show="isPieChartFullscreen" 
      position="center" 
      :style="{ width: '100vw', height: '100vh' }"
      closeable
      close-icon="cross"
      @closed="onPieChartClosed"
      @opened="onPieChartOpened"
      class="landscape-popup"
    >
      <div class="fullscreen-popup landscape-content">
        <div class="popup-header">
          <h3>{{ statsType === 'expense' ? '支出' : '收入' }}分类饼状图</h3>
        </div>
        <div ref="pieChartRef" class="fullscreen-chart-container"></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onUnmounted, watch, nextTick } from 'vue'
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
  Calendar as VanCalendar,
  Button as VanButton
} from 'vant'

const recordStore = useRecordStore()

// 响应式数据
const activeTab = ref('category')
const statsType = ref<'income' | 'expense'>('expense')
const chartType = ref<'bar' | 'line'>('bar')
const showDatePicker = ref(false)
const selectedDateRange = ref([
  (() => {
    const today = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(today.getMonth() - 3)
    return threeMonthsAgo
  })(), // 三个月前
  new Date() // 今天
])
const loading = ref(false)

// ECharts 相关
const chartRef = ref<HTMLDivElement>()
const fullscreenChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null
let fullscreenChartInstance: echarts.ECharts | null = null
let pieChartInstance: echarts.ECharts | null = null

// 全屏控制
const isFullscreen = ref(false)
const isPieChartFullscreen = ref(false)

// 计算属性 - 根据选定日期区间过滤记录
const filteredRecords = computed(() => {
  // 使用本地时间格式化日期，避免时区问题
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const startDate = formatLocalDate(selectedDateRange.value[0])
  const endDate = formatLocalDate(selectedDateRange.value[1])
  
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

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
  if (chartInstance) {
    chartInstance.dispose()
  }
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const startDate = selectedDateRange.value[0]
    const endDate = selectedDateRange.value[1]
    
    // 将Date对象转换为字符串格式 (YYYY-MM-DD)
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    await Promise.all([
      recordStore.loadRecords({ startDate: startDateStr, endDate: endDateStr, limit: 10000 }), // 加载指定日期区间的记录数据，设置较大的limit以获取所有记录
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



// 计算日期区间内的趋势数据（按周显示）
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
  
  // 统一按周显示
  const weekCount = Math.ceil(daysDiff / 7)
  
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
    
    // 格式化周标签
    const weekLabel = `${weekStartDate.getMonth() + 1}/${weekStartDate.getDate()}-${weekEndDate.getMonth() + 1}/${weekEndDate.getDate()}`
    
    trendData.push({
      startDate: weekStartDate,
      endDate: weekEndDate,
      label: weekLabel,
      income,
      expense
    })
  }
  
  return trendData
})

// 监听趋势数据变化，更新图表
watch(monthlyTrendData, () => {
  nextTick(() => {
    updateChart()
    // 如果全屏图表存在，也更新全屏图表
    if (fullscreenChartInstance) {
      updateFullscreenChart()
    }
  })
}, { deep: true })

// 监听图表类型变化，更新图表
watch(chartType, () => {
  nextTick(() => {
    updateChart()
    // 如果全屏图表存在，也更新全屏图表
    if (fullscreenChartInstance) {
      updateFullscreenChart()
    }
  })
})

// 监听活动标签变化，初始化图表
watch(activeTab, (newTab) => {
  if (newTab === 'trend') {
    nextTick(() => {
      initChart()
    })
  }
})

// 监听全屏状态变化
watch(isFullscreen, (newVal) => {
  if (newVal) {
    // 进入全屏时添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown)
  } else {
    // 退出全屏时移除键盘事件监听
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

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

// 判断是否为emoji图标
const isEmojiIcon = (icon: string) => {
  // 检查是否包含emoji字符（非ASCII字符且不是van-icon的name格式）
  return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon)
}

const calculatePercent = (amount: number) => {
  if (totalAmount.value === 0) return 0
  return Math.round((amount / totalAmount.value) * 100)
}

const viewCategoryDetail = (stat: any) => {
  // 跳转到分类详情页面
  console.log('查看分类详情:', stat)
}

// 显示饼状图
const showPieChart = () => {
  isPieChartFullscreen.value = true
  
  nextTick(() => {
    setTimeout(() => {
      initPieChart()
    }, 100)
  })
}

// 饼状图弹出框关闭处理
const onPieChartClosed = () => {
  // 销毁饼状图实例
  if (pieChartInstance) {
    pieChartInstance.dispose()
    pieChartInstance = null
  }
  // 恢复屏幕方向
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock()
  }
}

const onDateRangeConfirm = (values: [Date, Date]) => {
  selectedDateRange.value = values
  showDatePicker.value = false
}

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    // 打开弹出框时，延迟初始化全屏图表
    nextTick(() => {
      setTimeout(() => {
        initFullscreenChart()
      }, 100)
    })
  }
}

// 弹出框关闭处理
const onPopupClosed = () => {
  // 销毁全屏图表实例
  if (fullscreenChartInstance) {
    fullscreenChartInstance.dispose()
    fullscreenChartInstance = null
  }
  // 恢复屏幕方向
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock()
  }
}

// 全屏弹出框打开处理
const onFullscreenOpened = () => {
  // 强制横屏显示
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
      // 如果锁定失败，忽略错误
      console.log('无法锁定屏幕方向')
    })
  }
}

// 饼状图弹出框打开处理
const onPieChartOpened = () => {
  // 强制横屏显示
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
      // 如果锁定失败，忽略错误
      console.log('无法锁定屏幕方向')
    })
  }
}

// 初始化全屏图表
const initFullscreenChart = () => {
  if (!fullscreenChartRef.value) return
  
  // 销毁已存在的实例
  if (fullscreenChartInstance) {
    fullscreenChartInstance.dispose()
  }
  
  // 创建新实例
  fullscreenChartInstance = echarts.init(fullscreenChartRef.value)
  updateFullscreenChart()
}

// 更新全屏图表数据
const updateFullscreenChart = () => {
  if (!fullscreenChartInstance || !monthlyTrendData.value.length) return
  
  const categories = monthlyTrendData.value.map(item => item.label)
  const incomeData = monthlyTrendData.value.map(item => item.income)
  const expenseData = monthlyTrendData.value.map(item => item.expense)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: chartType.value === 'line' ? 'line' : 'shadow'
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
      left: '5%',
      right: '5%',
      bottom: categories.length > 5 ? '20%' : '8%',
      top: '15%',
      containLabel: true
    },
    dataZoom: categories.length > 5 ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: Math.max(0, ((categories.length - 5) / categories.length) * 100),
        end: 100,
        bottom: '8%'
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: Math.max(0, ((categories.length - 5) / categories.length) * 100),
        end: 100
      }
    ] : [],
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
        type: chartType.value,
        data: incomeData,
        itemStyle: {
          color: '#07c160'
        },
        lineStyle: chartType.value === 'line' ? {
          color: '#07c160',
          width: 3
        } : undefined,
        symbol: chartType.value === 'line' ? 'circle' : undefined,
        symbolSize: chartType.value === 'line' ? 6 : undefined
      },
      {
        name: '支出',
        type: chartType.value,
        data: expenseData,
        itemStyle: {
          color: '#ee0a24'
        },
        lineStyle: chartType.value === 'line' ? {
          color: '#ee0a24',
          width: 3
        } : undefined,
        symbol: chartType.value === 'line' ? 'circle' : undefined,
        symbolSize: chartType.value === 'line' ? 6 : undefined
      }
    ]
  }
  
  fullscreenChartInstance.setOption(option)
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
        type: chartType.value === 'line' ? 'line' : 'shadow'
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
      bottom: categories.length > 5 ? '15%' : '3%',
      top: '15%',
      containLabel: true
    },
    dataZoom: categories.length > 5 ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: Math.max(0, ((categories.length - 5) / categories.length) * 100),
        end: 100,
        bottom: '5%'
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: Math.max(0, ((categories.length - 5) / categories.length) * 100),
        end: 100
      }
    ] : [],
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
        type: chartType.value,
        data: incomeData,
        itemStyle: {
          color: chartType.value === 'line' ? '#22c55e' : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4ade80' },
            { offset: 1, color: '#22c55e' }
          ])
        },
        lineStyle: chartType.value === 'line' ? {
          color: '#22c55e',
          width: 3
        } : undefined,
        symbol: chartType.value === 'line' ? 'circle' : undefined,
        symbolSize: chartType.value === 'line' ? 6 : undefined,
        barWidth: chartType.value === 'bar' ? '30%' : undefined
      },
      {
        name: '支出',
        type: chartType.value,
        data: expenseData,
        itemStyle: {
          color: chartType.value === 'line' ? '#ef4444' : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f87171' },
            { offset: 1, color: '#ef4444' }
          ])
        },
        lineStyle: chartType.value === 'line' ? {
          color: '#ef4444',
          width: 3
        } : undefined,
        symbol: chartType.value === 'line' ? 'circle' : undefined,
        symbolSize: chartType.value === 'line' ? 6 : undefined,
        barWidth: chartType.value === 'bar' ? '30%' : undefined
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 饼状图初始化
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  // 销毁已存在的实例
  if (pieChartInstance) {
    pieChartInstance.dispose()
  }
  
  // 创建新实例
  pieChartInstance = echarts.init(pieChartRef.value)
  updatePieChart()
}

// 更新饼状图数据
const updatePieChart = () => {
  if (!pieChartInstance || !categoryStats.value.length) return
  
  const pieData = categoryStats.value.map(stat => ({
    name: getCategoryName(stat.categoryId),
    value: stat.amount,
    itemStyle: {
      color: getCategoryColor(stat.categoryId)
    }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const percent = params.percent
        const value = params.value.toLocaleString('zh-CN', {
          style: 'currency',
          currency: 'CNY',
          minimumFractionDigits: 2
        })
        return `${params.name}<br/>${params.marker}${value} (${percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12
      },
      formatter: function(name: string) {
        const stat = categoryStats.value.find(s => getCategoryName(s.categoryId) === name)
        if (stat) {
          const percent = calculatePercent(stat.amount)
          return `${name} ${percent}%`
        }
        return name
      }
    },
    series: [
      {
        name: statsType.value === 'expense' ? '支出分类' : '收入分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
            formatter: function(params: any) {
              const value = params.value.toLocaleString('zh-CN', {
                style: 'currency',
                currency: 'CNY',
                minimumFractionDigits: 0
              })
              return `${params.name}\n${value}`
            }
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }
  
  pieChartInstance.setOption(option)
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
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
}

.overview-card.income {
  border-left: 4px solid #51cf66;
  background: linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%);
}

.overview-card.balance {
  border-left: 4px solid #4ecdc4;
  background: linear-gradient(135deg, #f0fdff 0%, #e8f8ff 100%);
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

.overview-card.expense .card-value {
  color: #ff6b6b;
}

.overview-card.income .card-value {
  color: #51cf66;
}

.overview-card.balance .card-value {
  color: #4ecdc4;
}

.card-value.negative {
  color: #ff6b6b !important;
}

.card-count {
  font-size: 11px;
  color: #999;
}

/* 标签页内容 */
.tab-content {
  padding: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.type-selector {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 8px;
  flex: 1;
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

.emoji-icon {
  font-size: 20px;
  line-height: 1;
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
  margin-bottom: 12px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #323233;
  font-weight: 500;
}

.chart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 8px;
}

.chart-type-buttons {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.chart-actions .van-button {
  font-size: 12px;
  padding: 0 12px;
}

.echarts-container {
  width: 100%;
  height: 300px;
  transition: all 0.3s ease;
}

/* 全屏弹出框样式 */
.fullscreen-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; /* 防止滚动条 */
}

/* 横屏模式样式 */
.landscape-popup {
  background: white;
}

.landscape-content {
  width: 100%;
  height: 100%;
}

/* 横屏时的特殊样式 */
@media screen and (orientation: landscape) {
  .landscape-popup .fullscreen-popup {
    padding: 10px 20px;
  }
  
  .landscape-popup .popup-header {
    margin-bottom: 10px;
  }
  
  .landscape-popup .popup-header h3 {
    font-size: 16px;
  }
  
  .landscape-popup .fullscreen-chart-container {
    height: calc(100% - 50px);
  }
}

.popup-header {
  margin-bottom: 20px;
  text-align: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: #323233;
  font-weight: 500;
}

.fullscreen-chart-container {
  flex: 1;
  width: 100%;
  height: 0; /* 让flex: 1生效 */
  min-height: 0; /* 避免最小高度限制 */
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