<template>
  <div class="add-record">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="记账"
      left-text="取消"
      right-text="保存"
      left-arrow
      @click-left="onCancel"
      @click-right="onSave"
      fixed
    />

    <div class="add-record-content">
      <!-- 金额输入 -->
      <div class="amount-section">
        <div class="amount-display">
          <span class="currency">¥</span>
          <span class="amount">{{ displayAmount || '0.00' }}</span>
        </div>
        
        <!-- 数字键盘 -->
        <div class="keyboard">
          <div class="keyboard-row">
            <button v-for="num in [1, 2, 3]" :key="num" @click="inputNumber(num)" class="key-btn">
              {{ num }}
            </button>
          </div>
          <div class="keyboard-row">
            <button v-for="num in [4, 5, 6]" :key="num" @click="inputNumber(num)" class="key-btn">
              {{ num }}
            </button>
          </div>
          <div class="keyboard-row">
            <button v-for="num in [7, 8, 9]" :key="num" @click="inputNumber(num)" class="key-btn">
              {{ num }}
            </button>
          </div>
          <div class="keyboard-row">
            <button @click="inputDot" class="key-btn">.</button>
            <button @click="inputNumber(0)" class="key-btn">0</button>
            <button @click="deleteNumber" class="key-btn delete">
              <van-icon name="clear" />
            </button>
          </div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <!-- 类型选择 -->
        <van-cell-group>
          <van-cell title="类型">
            <template #value>
              <van-radio-group v-model="form.type" direction="horizontal">
                <van-radio name="expense" icon-size="16px">支出</van-radio>
                <van-radio name="income" icon-size="16px">收入</van-radio>
              </van-radio-group>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 分类选择 -->
        <van-cell-group>
          <van-cell
            title="分类"
            :value="selectedCategoryName"
            is-link
            @click="showCategoryPicker = true"
          />
        </van-cell-group>

        <!-- 账户选择 -->
        <van-cell-group>
          <van-cell
            title="账户"
            :value="selectedAccountName"
            is-link
            @click="showAccountPicker = true"
          />
        </van-cell-group>

        <!-- 日期选择 -->
        <van-cell-group>
          <van-cell
            title="日期"
            :value="formatDate(form.date)"
            is-link
            @click="showDatePicker = true"
          />
        </van-cell-group>

        <!-- 备注输入 -->
        <van-cell-group>
          <van-field
            v-model="form.note"
            label="备注"
            placeholder="添加备注（可选）"
            maxlength="50"
            show-word-limit
          />
        </van-cell-group>
      </div>
    </div>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryColumns"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
        title="选择分类"
      />
    </van-popup>

    <!-- 账户选择器 -->
    <van-popup v-model:show="showAccountPicker" position="bottom">
      <van-picker
        :columns="accountColumns"
        @confirm="onAccountConfirm"
        @cancel="showAccountPicker = false"
        title="选择账户"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecordStore } from '../stores/recordStore'
import { useAuthStore } from '../stores/authStore'
import { DatabaseService } from '../services/database'
import { formatAmount, generateId } from '../utils'
import {
  NavBar as VanNavBar,
  CellGroup as VanCellGroup,
  Cell as VanCell,
  Field as VanField,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  Popup as VanPopup,
  Picker as VanPicker,
  DatePicker as VanDatePicker,
  Icon as VanIcon,
  showToast
} from 'vant'
import type { Record, Category, Account } from '../types'

const router = useRouter()
const route = useRoute()
const recordStore = useRecordStore()
const authStore = useAuthStore()

// 响应式数据
const amountInput = ref('')
const showCategoryPicker = ref(false)
const showAccountPicker = ref(false)
const showDatePicker = ref(false)
const now = new Date()
const selectedDate = ref([now.getFullYear(), now.getMonth() + 1, now.getDate()])

const form = ref({
  type: 'expense' as 'income' | 'expense',
  categoryId: '',
  accountId: '',
  date: new Date().toISOString(),
  note: ''
})

// 同步selectedDate和form.date
watch(() => form.value.date, (newDate) => {
  const date = new Date(newDate)
  // 确保日期有效
  if (!isNaN(date.getTime())) {
    selectedDate.value = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
  }
}, { immediate: true })

// 计算属性
const displayAmount = computed(() => {
  if (!amountInput.value) return ''
  const num = parseFloat(amountInput.value)
  return isNaN(num) ? '' : num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

const selectedCategoryName = computed(() => {
  const category = recordStore.categories.find(c => c.id === form.value.categoryId)
  return category?.name || '请选择分类'
})

const selectedAccountName = computed(() => {
  const account = recordStore.accounts.find(a => a.id === form.value.accountId)
  return account?.name || '请选择账户'
})

const categoryColumns = computed(() => {
  const categories = recordStore.categories.filter(c => c.type === form.value.type)
  return categories.map(category => ({
    text: category.name,
    value: category.id
  }))
})

const accountColumns = computed(() => {
  return recordStore.accounts.map(account => ({
    text: account.name,
    value: account.id
  }))
})

// 监听类型变化，重置分类选择
watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

// 生命周期
onMounted(async () => {
  // 确保用户有默认数据
  if (authStore.user?.id) {
    await DatabaseService.ensureUserDefaultData(authStore.user.id)
  }
  
  // 加载分类和账户数据
  await recordStore.loadCategories()
  await recordStore.loadAccounts()
  
  // 从路由参数获取类型
  const type = route.query.type as string
  if (type === 'income' || type === 'expense') {
    form.value.type = type
  }
  
  // 设置默认账户
  if (recordStore.accounts.length > 0) {
    form.value.accountId = recordStore.accounts[0].id
  }
})

// 方法
const inputNumber = (num: number) => {
  if (amountInput.value.includes('.') && amountInput.value.split('.')[1].length >= 2) {
    return // 小数点后最多两位
  }
  amountInput.value += num.toString()
}

const inputDot = () => {
  if (!amountInput.value.includes('.')) {
    amountInput.value += amountInput.value ? '.' : '0.'
  }
}

const deleteNumber = () => {
  amountInput.value = amountInput.value.slice(0, -1)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const onCategoryConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  form.value.categoryId = selectedValues[0]
  showCategoryPicker.value = false
}

const onAccountConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  form.value.accountId = selectedValues[0]
  showAccountPicker.value = false
}

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
  
  form.value.date = date.toISOString()
  showDatePicker.value = false
}

const onCancel = () => {
  router.back()
}

const onSave = async () => {
  // 验证表单
  if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
    showToast('请输入有效金额')
    return
  }
  
  if (!form.value.categoryId) {
    showToast('请选择分类')
    return
  }
  
  if (!form.value.accountId) {
    showToast('请选择账户')
    return
  }

  try {
    const record: Omit<Record, 'id'> = {
      type: form.value.type,
      amount: parseFloat(amountInput.value),
      categoryId: String(form.value.categoryId),
      accountId: String(form.value.accountId),
      date: form.value.date,
      note: form.value.note.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await recordStore.addRecord(record)
    showToast('记录已保存')
    router.back()
  } catch (error) {
    console.error('保存记录失败:', error)
    showToast('保存失败，请重试')
  }
}
</script>

<style scoped>
.add-record {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.add-record-content {
  padding-top: 46px;
}

/* 金额输入区域 */
.amount-section {
  background: white;
  padding: 20px;
  margin-bottom: 12px;
}

.amount-display {
  text-align: center;
  margin-bottom: 20px;
}

.currency {
  font-size: 24px;
  color: #666;
  margin-right: 8px;
}

.amount {
  font-size: 36px;
  font-weight: 600;
  color: #333;
}

/* 数字键盘 */
.keyboard {
  max-width: 300px;
  margin: 0 auto;
}

.keyboard-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.keyboard-row:last-child {
  margin-bottom: 0;
}

.key-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-btn:hover {
  background: #e9ecef;
}

.key-btn:active {
  transform: scale(0.95);
  background: #dee2e6;
}

.key-btn.delete {
  background: #ff6b6b;
  color: white;
}

.key-btn.delete:hover {
  background: #ff5252;
}

/* 表单区域 */
.form-section {
  padding: 0 16px;
}

.form-section :deep(.van-cell-group) {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.form-section :deep(.van-cell) {
  padding: 16px;
}

.form-section :deep(.van-radio-group) {
  display: flex;
  gap: 16px;
}

.form-section :deep(.van-radio) {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .amount-display {
    margin-bottom: 16px;
  }
  
  .currency {
    font-size: 20px;
  }
  
  .amount {
    font-size: 32px;
  }
  
  .keyboard {
    max-width: 280px;
  }
  
  .key-btn {
    height: 44px;
    font-size: 16px;
  }
  
  .form-section {
    padding: 0 12px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .add-record {
    background-color: #121212;
  }
  
  .amount-section {
    background: #1f1f1f;
  }
  
  .amount {
    color: #fff;
  }
  
  .key-btn {
    background: #2a2a2a;
    color: #fff;
  }
  
  .key-btn:hover {
    background: #333;
  }
  
  .key-btn:active {
    background: #404040;
  }
}
</style>