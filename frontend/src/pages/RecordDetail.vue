<template>
  <div class="record-detail">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="isEditing ? '编辑记录' : '记录详情'"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <van-button
          v-if="!isEditing"
          type="primary"
          size="small"
          @click="startEdit"
        >
          编辑
        </van-button>
        <van-button
          v-else
          type="primary"
          size="small"
          @click="saveRecord"
          :loading="saving"
        >
          保存
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading" vertical>
      加载中...
    </van-loading>

    <!-- 记录不存在 -->
    <van-empty v-else-if="!record" description="记录不存在" />

    <!-- 记录详情 -->
    <div v-else class="detail-content">
      <!-- 金额显示 -->
      <div class="amount-section">
        <div class="amount-label">{{ record.type === 'income' ? '收入' : '支出' }}</div>
        <div class="amount-value" :class="record.type">
          {{ record.type === 'income' ? '+' : '-' }}{{ formatAmount(record.amount) }}
        </div>
      </div>

      <!-- 详情表单 -->
      <van-form @submit="saveRecord">
        <!-- 分类 -->
        <van-field
          v-model="formData.categoryName"
          label="分类"
          placeholder="选择分类"
          readonly
          is-link
          @click="showCategoryPicker = true"
        />

        <!-- 账户 -->
        <van-field
          v-model="formData.accountName"
          label="账户"
          placeholder="选择账户"
          readonly
          is-link
          @click="showAccountPicker = true"
        />

        <!-- 日期 -->
        <van-field
          v-model="formData.dateText"
          label="日期"
          placeholder="选择日期"
          readonly
          is-link
          @click="showDatePicker = true"
        />

        <!-- 金额 -->
        <van-field
          v-model="formData.amount"
          label="金额"
          placeholder="请输入金额"
          type="number"
          :readonly="!isEditing"
          :rules="[{ required: true, message: '请输入金额' }]"
        />

        <!-- 备注 -->
        <van-field
          v-model="formData.note"
          label="备注"
          placeholder="添加备注"
          type="textarea"
          rows="3"
          :readonly="!isEditing"
        />
      </van-form>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="!isEditing">
        <van-button
          type="danger"
          size="large"
          @click="showDeleteConfirm = true"
        >
          删除记录
        </van-button>
      </div>
    </div>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryColumns"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>

    <!-- 账户选择器 -->
    <van-popup v-model:show="showAccountPicker" position="bottom">
      <van-picker
        :columns="accountColumns"
        @confirm="onAccountConfirm"
        @cancel="showAccountPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        type="date"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        title="选择日期"
      />
    </van-popup>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      message="删除后无法恢复，确定要删除这条记录吗？"
      show-cancel-button
      @confirm="deleteRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useRecordStore } from '../stores/recordStore'
import { formatAmount, formatDate } from '../utils'
import type { Record, Category, Account } from '../types'

const route = useRoute()
const router = useRouter()
const recordStore = useRecordStore()

// 状态
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const record = ref<Record | null>(null)

// 表单数据
const formData = reactive({
  amount: '',
  categoryName: '',
  accountName: '',
  dateText: '',
  note: ''
})

// 选择器状态
const showCategoryPicker = ref(false)
const showAccountPicker = ref(false)
const showDatePicker = ref(false)
const showDeleteConfirm = ref(false)
const selectedDate = ref<number[]>([new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()])

// 分类选项
const categoryColumns = computed(() => {
  if (!record.value) return []
  
  const categories = recordStore.categories.filter(
    category => category.type === record.value!.type
  )
  
  return categories.map(category => ({
    text: category.name,
    value: category.id
  }))
})

// 账户选项
const accountColumns = computed(() => {
  return recordStore.accounts.map(account => ({
    text: account.name,
    value: account.id
  }))
})

// 加载记录详情
const loadRecord = async () => {
  const recordId = route.params.id as string
  if (!recordId) {
    showToast('记录ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    // 确保数据已加载
    await Promise.all([
      recordStore.loadRecords(),
      recordStore.loadCategories(),
      recordStore.loadAccounts()
    ])

    // 查找记录
    const foundRecord = recordStore.records.find(r => r.id === recordId)
    if (!foundRecord) {
      showToast('记录不存在')
      router.back()
      return
    }

    record.value = foundRecord
    updateFormData()
  } catch (error) {
    console.error('加载记录失败:', error)
    showToast('加载记录失败')
  } finally {
    loading.value = false
  }
}

// 更新表单数据
const updateFormData = () => {
  if (!record.value) return

  const category = recordStore.categories.find(c => c.id === record.value!.categoryId)
  const account = recordStore.accounts.find(a => a.id === record.value!.accountId)

  formData.amount = record.value.amount.toString()
  formData.categoryName = category?.name || ''
  formData.accountName = account?.name || ''
  formData.dateText = formatDate(record.value.date)
  formData.note = record.value.note || ''

  // 设置日期选择器的值
  const date = new Date(record.value.date)
  selectedDate.value = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  ]
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  updateFormData() // 恢复原始数据
}

// 保存记录
const saveRecord = async () => {
  if (!record.value) return

  // 验证表单
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    showToast('请输入有效金额')
    return
  }

  if (!formData.categoryName) {
    showToast('请选择分类')
    return
  }

  if (!formData.accountName) {
    showToast('请选择账户')
    return
  }

  saving.value = true
  try {
    const category = recordStore.categories.find(c => c.name === formData.categoryName)
    const account = recordStore.accounts.find(a => a.name === formData.accountName)

    if (!category || !account) {
      showToast('分类或账户不存在')
      return
    }

    // 构建日期字符串
    const dateStr = `${selectedDate.value[0]}-${selectedDate.value[1]}-${selectedDate.value[2]}`

    const updateData = {
      amount: parseFloat(formData.amount),
      categoryId: category.id,
      accountId: account.id,
      date: dateStr,
      note: formData.note
    }

    await recordStore.updateRecord(record.value.id, updateData)
    
    // 更新本地记录
    Object.assign(record.value, updateData)
    
    isEditing.value = false
    showToast('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

// 删除记录
const deleteRecord = async () => {
  if (!record.value) return

  try {
    await recordStore.deleteRecord(record.value.id)
    showToast('删除成功')
    router.back()
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败')
  }
}

// 分类选择确认
const onCategoryConfirm = ({ selectedOptions }: any) => {
  formData.categoryName = selectedOptions[0].text
  showCategoryPicker.value = false
}

// 账户选择确认
const onAccountConfirm = ({ selectedOptions }: any) => {
  formData.accountName = selectedOptions[0].text
  showAccountPicker.value = false
}

// 日期选择确认
const onDateConfirm = (value: any) => {
  console.log('onDateConfirm received:', value, typeof value)
  
  // 处理Vant DatePicker的参数格式
  let dateValues: number[]
  if (Array.isArray(value)) {
    dateValues = value
  } else if (value && Array.isArray(value.selectedValues)) {
    dateValues = value.selectedValues
  } else {
    console.error('onDateConfirm: invalid value format:', value)
    return
  }
  
  // 确保数组有足够的元素
  if (dateValues.length < 3) {
    console.error('onDateConfirm: dateValues array length is insufficient:', dateValues)
    return
  }
  
  selectedDate.value = dateValues
  // 确保所有值都是有效数字
  const year = Number(dateValues[0]) || new Date().getFullYear()
  const month = Number(dateValues[1]) || new Date().getMonth() + 1
  const day = Number(dateValues[2]) || new Date().getDate()
  
  // 验证日期是否有效
  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', { year, month, day })
    return
  }
  
  formData.dateText = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  showDatePicker.value = false
}

// 返回处理
const handleBack = () => {
  if (isEditing.value) {
    cancelEdit()
  } else {
    router.back()
  }
}

// 组件挂载
onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.record-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.detail-content {
  padding: 16px;
}

.amount-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.amount-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.amount-value.income {
  color: #07c160;
}

.amount-value.expense {
  color: #ee0a24;
}

.action-buttons {
  margin-top: 24px;
  padding: 0 16px;
}

/* 移除硬编码的深色主题样式，使用主题变量系统 */

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-content {
    padding: 12px;
  }

  .amount-section {
    padding: 20px;
  }

  .amount-value {
    font-size: 28px;
  }
}
</style>