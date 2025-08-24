<template>
  <div class="record-item" @click="$emit('click', record)">
    <div class="record-left">
      <div class="category-icon" :style="{ backgroundColor: categoryColor }">
        <span v-if="isEmojiIcon" class="emoji-icon">{{ categoryIcon }}</span>
        <van-icon v-else :name="categoryIcon" />
      </div>
      
      <div class="record-info">
        <div class="record-category">{{ getCategoryName(record.categoryId) }}</div>
        <div class="record-details">
          <span v-if="record.note" class="record-note">{{ record.note }}</span>
          <span class="record-time">{{ formatTime(record.date) }}</span>
          <span v-if="record.accountId" class="record-account">
            {{ getAccountName(record.accountId) }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="record-right">
      <div class="record-amount" :class="record.type">
        {{ record.type === 'expense' ? '-' : '+' }}{{ formatAmount(record.amount) }}
      </div>
      
      <div v-if="showActions" class="record-actions">
        <van-icon 
          name="edit" 
          size="16" 
          @click.stop="$emit('edit', record)"
          class="action-icon"
        />
        <van-icon 
          name="delete" 
          size="16" 
          @click.stop="$emit('delete', record)"
          class="action-icon delete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecordStore } from '../stores/recordStore'
import { formatAmount, formatRelativeTime, getCategoryColor, getCategoryIcon } from '../utils'
import { Icon as VanIcon } from 'vant'
import type { Record } from '../types'

interface Props {
  record: Record
  showActions?: boolean
}

interface Emits {
  click: [record: Record]
  edit: [record: Record]
  delete: [record: Record]
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

defineEmits<Emits>()

const recordStore = useRecordStore()

// 计算属性
const category = computed(() => {
  return recordStore.categories.find(c => c.id === props.record.categoryId)
})

const getCategoryName = (categoryId: string) => {
  const category = recordStore.categories.find(c => c.id === categoryId)
  return category?.name || '未知分类'
}

const getAccountName = (accountId: string) => {
  const account = recordStore.accounts.find(a => a.id === accountId)
  return account?.name || ''
}

const formatTime = (date: string) => {
  return formatRelativeTime(new Date(date))
}

// 分类图标和颜色
const categoryIcon = computed(() => {
  return category.value?.icon || '📦'
})

const categoryColor = computed(() => {
  return category.value?.color || '#a4b0be'
})

// 判断是否为emoji图标
const isEmojiIcon = computed(() => {
  const icon = categoryIcon.value
  // 检查是否为emoji（包含非ASCII字符）
  return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon)
})
</script>

<style scoped>
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.record-item:hover {
  background-color: #f8f9fa;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
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
  flex-shrink: 0;
}

.emoji-icon {
  font-size: 20px;
  line-height: 1;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-category {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-details {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  gap: 8px;
}

.record-note {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-time {
  flex-shrink: 0;
}

.record-account {
  flex-shrink: 0;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.record-amount.expense {
  color: #ff6b6b;
}

.record-amount.income {
  color: #51cf66;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #666;
}

.action-icon.delete:hover {
  color: #ff6b6b;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .record-item {
    padding: 10px 12px;
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
    margin-right: 10px;
  }
  
  .record-category {
    font-size: 15px;
  }
  
  .record-details {
    font-size: 11px;
    gap: 6px;
  }
  
  .record-note {
    max-width: 80px;
  }
  
  .record-amount {
    font-size: 15px;
  }
}

/* 移除硬编码的暗色主题样式，使用主题变量系统 */
</style>