<template>
  <div class="account-list">
    <div v-if="accounts.length === 0" class="empty-state">
      <div class="empty-icon">💳</div>
      <p class="empty-text">暂无账户</p>
      <p class="empty-hint">点击右上角 + 号添加账户</p>
    </div>
    
    <div v-else class="account-items">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="account-item"
      >
        <div class="account-info">
          <div class="account-icon">
            {{ account.icon || getAccountIcon(account.type) }}
          </div>
          <div class="account-details">
            <div class="account-name">{{ account.name }}</div>
            <div class="account-meta">
              <span class="account-type">{{ getAccountTypeText(account.type) }}</span>
              <span class="account-date">{{ formatDate(account.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="account-balance">
          <div class="balance-amount" :class="{ negative: account.balance < 0 }">
            ¥{{ formatAmount(account.balance) }}
          </div>
        </div>
        
        <div class="account-actions">
          <button class="action-btn edit-btn" @click="handleEdit(account)">
            <i class="icon-edit">✏️</i>
          </button>
          <button class="action-btn delete-btn" @click="handleDelete(account)">
            <i class="icon-delete">🗑️</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Account } from '../types'
import { formatDate } from '../utils'

defineProps<{
  accounts: Account[]
}>()

const emit = defineEmits<{
  edit: [account: Account]
  delete: [account: Account]
}>()

const handleEdit = (account: Account) => {
  emit('edit', account)
}

const handleDelete = (account: Account) => {
  emit('delete', account)
}

const getAccountIcon = (type: Account['type']) => {
  const icons = {
    cash: '💵',
    bank: '🏦',
    credit: '💳',
    alipay: '📱',
    wechat: '💬',
    other: '📝'
  }
  return icons[type] || '📝'
}

const getAccountTypeText = (type: Account['type']) => {
  const typeTexts = {
    cash: '现金',
    bank: '银行卡',
    credit: '信用卡',
    alipay: '支付宝',
    wechat: '微信',
    other: '其他'
  }
  return typeTexts[type] || '其他'
}

const formatAmount = (amount: number) => {
  return Math.abs(amount).toFixed(2)
}
</script>

<style scoped>
.account-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.account-items {
  display: flex;
  flex-direction: column;
}

.account-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.account-item:last-child {
  border-bottom: none;
}

.account-item:hover {
  background: var(--hover-bg);
}

.account-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.account-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.account-details {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.account-type {
  background: var(--tag-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.account-balance {
  margin-right: 12px;
  text-align: right;
}

.balance-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--success-color);
}

.balance-amount.negative {
  color: var(--danger-color);
}

.account-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.edit-btn {
  background: var(--primary-light);
  color: var(--primary-color);
}

.edit-btn:hover {
  background: var(--primary-color);
  color: white;
}

.delete-btn {
  background: var(--danger-light);
  color: var(--danger-color);
}

.delete-btn:hover {
  background: var(--danger-color);
  color: white;
}

/* 移除硬编码的深色主题样式，使用主题变量系统 */

/* 响应式设计 */
@media (max-width: 768px) {
  .account-item {
    padding: 12px;
  }
  
  .account-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .account-name {
    font-size: 15px;
  }
  
  .balance-amount {
    font-size: 15px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>