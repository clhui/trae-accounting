<template>
  <div class="account-manage">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h1 class="page-title">账户管理</h1>
      <button class="add-btn" @click="showAddDialog = true">
        <i class="icon-plus">+</i>
        <span>添加账户</span>
      </button>
    </div>

    <!-- 账户列表 -->
    <div class="account-list-container">
      <AccountList
        :accounts="accounts"
        @edit="editAccount"
        @delete="confirmDeleteAccount"
      />
    </div>

    <!-- 添加/编辑账户弹窗 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ isEditing ? '编辑账户' : '添加账户' }}</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        
        <div class="dialog-body">
          <div class="form-group">
            <label>账户名称</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入账户名称"
              maxlength="20"
            />
          </div>
          
          <div class="form-group">
            <label>账户类型</label>
            <div class="type-selector">
              <button
                v-for="type in accountTypes"
                :key="type.value"
                :class="['type-btn', { active: formData.type === type.value }]"
                @click="formData.type = type.value"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-name">{{ type.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>初始余额</label>
            <input
              v-model.number="formData.balance"
              type="number"
              step="0.01"
              placeholder="请输入初始余额"
            />
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="save-btn" @click="saveAccount" :disabled="!formData.name.trim()">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="showDeleteDialog = false">
      <div class="dialog delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认删除</h3>
        </div>
        
        <div class="dialog-body">
          <p>确定要删除账户「{{ accountToDelete?.name }}」吗？</p>
          <p class="warning">删除后无法恢复，请谨慎操作！</p>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showDeleteDialog = false">取消</button>
          <button class="delete-btn" @click="deleteAccount">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecordStore } from '../stores/recordStore'
import type { Account } from '../types'
import AccountList from '../components/AccountList.vue'
import { showToast } from 'vant'

const recordStore = useRecordStore()

// 状态管理
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const accountToDelete = ref<Account | null>(null)

// 表单数据
const formData = ref({
  name: '',
  type: 'cash' as Account['type'],
  balance: 0
})

// 计算属性
const accounts = computed(() => recordStore.accounts)

// 账户类型选项
const accountTypes = [
  { value: 'cash', label: '现金', icon: '💵' },
  { value: 'bank', label: '银行卡', icon: '🏦' },
  { value: 'credit', label: '信用卡', icon: '💳' },
  { value: 'alipay', label: '支付宝', icon: '📱' },
  { value: 'wechat', label: '微信', icon: '💬' },
  { value: 'other', label: '其他', icon: '📝' }
]

// 方法
const editAccount = (account: Account) => {
  isEditing.value = true
  editingId.value = account.id
  formData.value = {
    name: account.name,
    type: account.type,
    balance: account.balance
  }
  showAddDialog.value = true
}

const confirmDeleteAccount = (account: Account) => {
  accountToDelete.value = account
  showDeleteDialog.value = true
}

const saveAccount = async () => {
  if (!formData.value.name.trim()) {
    showToast('请输入账户名称')
    return
  }
  
  try {
    if (isEditing.value && editingId.value) {
      await recordStore.updateAccount(editingId.value, formData.value)
      showToast('账户更新成功')
    } else {
      await recordStore.addAccount(formData.value)
      showToast('账户添加成功')
    }
    
    closeDialog()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '操作失败')
  }
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return
  
  try {
    await recordStore.deleteAccount(accountToDelete.value.id)
    showToast('账户删除成功')
    showDeleteDialog.value = false
    accountToDelete.value = null
  } catch (error) {
    showToast(error instanceof Error ? error.message : '删除失败')
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  isEditing.value = false
  editingId.value = null
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    type: 'cash',
    balance: 0
  }
}

// 生命周期
onMounted(() => {
  recordStore.loadAccounts()
})
</script>

<style scoped>
.account-manage {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.add-btn:active {
  transform: translateY(0);
  transition: transform 0.1s;
}

.add-btn i {
  font-size: 16px;
}

.account-list-container {
  padding: 16px;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog {
  background: var(--card-bg);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--hover-bg);
}

.dialog-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: var(--primary-color);
}

.type-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.type-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.type-name {
  font-size: 12px;
  color: var(--text-primary);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn, .save-btn, .delete-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--hover-bg);
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: var(--danger-color);
  color: white;
}

.delete-btn:hover {
  background: var(--danger-dark);
}

.delete-dialog .dialog-body {
  text-align: center;
}

.delete-dialog .dialog-body p {
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.warning {
  color: var(--danger-color) !important;
  font-size: 13px;
}

/* 移除硬编码的深色主题样式，使用主题变量系统 */

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog {
    margin: 0;
    border-radius: 12px 12px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 90vh;
  }
  
  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>