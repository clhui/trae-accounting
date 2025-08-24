<template>
  <div class="account-manage">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="账户管理"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
      class="custom-nav"
    >
      <template #right>
        <div class="nav-actions">
          <van-button
            type="primary"
            size="small"
            round
            icon="plus"
            @click="showAddDialog = true"
            class="add-btn"
          >
            添加账户
          </van-button>
        </div>
      </template>
    </van-nav-bar>

    <!-- 主要内容 -->
    <div class="account-content">
      <!-- 资产概览卡片 -->
      <div class="assets-overview">
        <div class="assets-card">
          <div class="assets-header">
            <div class="assets-icon">
              <van-icon name="gold-coin-o" />
            </div>
            <div class="assets-info">
              <div class="assets-label">总资产</div>
              <div class="assets-amount">{{ formatAmount(totalAssets) }}</div>
            </div>
          </div>
          <div class="assets-stats">
            <div class="stat-item">
              <div class="stat-value">{{ recordStore.accounts.length }}</div>
              <div class="stat-label">账户数量</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ defaultAccount?.name || '未设置' }}</div>
              <div class="stat-label">默认账户</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户列表 -->
      <div class="accounts-section">
        <div class="section-header">
          <h3 class="section-title">我的账户</h3>
          <div class="account-count">{{ recordStore.accounts.length }} 个账户</div>
        </div>
        
        <div class="account-grid">
          <div
            v-for="account in recordStore.accounts"
            :key="account.id"
            class="account-card"
            @click="viewAccountDetail(account)"
          >
            <div class="card-header">
              <div class="account-avatar" :style="{ backgroundColor: account.color }">
                <span class="avatar-icon">{{ account.icon }}</span>
              </div>
              <div class="account-badges">
                <van-tag v-if="account.isDefault" type="primary" size="mini" round>
                  <van-icon name="star" size="10" />
                  默认
                </van-tag>
              </div>
            </div>
            
            <div class="card-content">
              <div class="account-name">{{ account.name }}</div>
              <div class="account-type">{{ getAccountTypeText(account.type) }}</div>
              <div class="account-balance">{{ formatAmount(account.balance) }}</div>
            </div>
            
            <div class="card-actions">
              <van-button
                size="mini"
                type="primary"
                plain
                round
                icon="edit"
                @click.stop="editAccount(account)"
              >
                编辑
              </van-button>
              <van-button
                size="mini"
                type="danger"
                plain
                round
                icon="delete"
                @click.stop="deleteAccount(account)"
                :disabled="account.isDefault"
              >
                删除
              </van-button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <van-empty
          v-if="recordStore.accounts.length === 0"
          description="暂无账户"
          class="empty-state"
        >
          <van-button
            type="primary"
            round
            @click="showAddDialog = true"
            class="empty-action"
          >
            创建第一个账户
          </van-button>
        </van-empty>
      </div>
    </div>

    <!-- 添加/编辑账户弹窗 -->
    <van-dialog
      v-model:show="showAddDialog"
      :title="editingAccount ? '编辑账户' : '添加账户'"
      show-cancel-button
      @confirm="saveAccount"
      @cancel="resetForm"
    >
      <div class="account-form">
        <!-- 账户名称 -->
        <van-field
          v-model="formData.name"
          label="名称"
          placeholder="请输入账户名称"
          :rules="[{ required: true, message: '请输入账户名称' }]"
        />

        <!-- 账户类型 -->
        <van-field
          v-model="formData.typeText"
          label="类型"
          placeholder="选择账户类型"
          readonly
          is-link
          @click="showTypePicker = true"
        />

        <!-- 图标选择 -->
        <van-field
          v-model="formData.iconText"
          label="图标"
          placeholder="选择图标"
          readonly
          is-link
          @click="showIconPicker = true"
        />

        <!-- 颜色选择 -->
        <van-field
          v-model="formData.color"
          label="颜色"
          placeholder="选择颜色"
          readonly
          is-link
          @click="showColorPicker = true"
        >
          <template #right-icon>
            <div
              class="color-preview"
              :style="{ backgroundColor: formData.color }"
            ></div>
          </template>
        </van-field>

        <!-- 初始余额 -->
        <van-field
          v-model="formData.balance"
          label="余额"
          placeholder="请输入初始余额"
          type="number"
        />

        <!-- 设为默认 -->
        <van-field label="设为默认账户">
          <template #input>
            <van-switch v-model="formData.isDefault" />
          </template>
        </van-field>
      </div>
    </van-dialog>

    <!-- 账户类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 图标选择器 -->
    <van-popup v-model:show="showIconPicker" position="bottom">
      <div class="icon-picker">
        <div class="icon-picker-header">
          <h3>选择图标</h3>
          <van-button type="primary" size="small" @click="showIconPicker = false">
            确定
          </van-button>
        </div>
        <div class="icon-grid">
          <div
            v-for="icon in iconOptions"
            :key="icon.value"
            class="icon-item"
            :class="{ active: formData.icon === icon.value }"
            @click="selectIcon(icon)"
          >
            <span class="emoji-icon">{{ icon.value }}</span>
            <span class="icon-name">{{ icon.text }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 颜色选择器 -->
    <van-popup v-model:show="showColorPicker" position="bottom">
      <div class="color-picker">
        <div class="color-picker-header">
          <h3>选择颜色</h3>
          <van-button type="primary" size="small" @click="showColorPicker = false">
            确定
          </van-button>
        </div>
        <div class="color-grid">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-item"
            :class="{ active: formData.color === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          >
            <van-icon v-if="formData.color === color" name="success" color="white" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      message="删除账户后，相关记录的账户将被清空，确定要删除吗？"
      show-cancel-button
      @confirm="confirmDelete"
    />

    <!-- 账户详情弹窗 -->
    <van-popup v-model:show="showAccountDetail" position="bottom" :style="{ height: '60%' }">
      <div class="account-detail" v-if="selectedAccount">
        <div class="detail-header">
          <h3>{{ selectedAccount.name }}</h3>
          <van-button type="primary" size="small" @click="showAccountDetail = false">
            关闭
          </van-button>
        </div>
        <div class="detail-content">
          <div class="detail-item">
            <span class="label">账户类型:</span>
            <span class="value">{{ getAccountTypeText(selectedAccount.type) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">当前余额:</span>
            <span class="value">{{ formatAmount(selectedAccount.balance) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(selectedAccount.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatDate(selectedAccount.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { showToast } from 'vant'
import { useRecordStore } from '../stores/recordStore'
import { formatAmount, formatDate } from '../utils'
import type { Account } from '../types'

const recordStore = useRecordStore()

// 状态
const showAddDialog = ref(false)
const showTypePicker = ref(false)
const showIconPicker = ref(false)
const showColorPicker = ref(false)
const showDeleteConfirm = ref(false)
const showAccountDetail = ref(false)
const editingAccount = ref<Account | null>(null)
const deletingAccountId = ref<string>('')
const selectedAccount = ref<Account | null>(null)

// 表单数据
const formData = reactive({
  name: '',
  type: 'cash' as 'cash' | 'bank' | 'digital',
  typeText: '现金',
  icon: '💵',
  iconText: '现金',
  color: '#2ed573',
  balance: '0',
  isDefault: false
})

// 计算属性
const totalAssets = computed(() => {
  return recordStore.accounts.reduce((total, account) => total + account.balance, 0)
})

const defaultAccount = computed(() => {
  return recordStore.accounts.find(account => account.isDefault)
})

// 账户类型选项
const typeColumns = [
  { text: '现金', value: 'cash' },
  { text: '银行卡', value: 'bank' },
  { text: '数字钱包', value: 'digital' }
]

// 图标选项
const iconOptions = [
  { text: '现金', value: '💵' },
  { text: '银行卡', value: '💳' },
  { text: '支付宝', value: '📱' },
  { text: '微信', value: '💬' },
  { text: '钱包', value: '👛' },
  { text: '金币', value: '🪙' },
  { text: '礼品', value: '🎁' },
  { text: '购物车', value: '🛒' },
  { text: '星星', value: '⭐' },
  { text: '心形', value: '❤️' },
  { text: '设置', value: '⚙️' },
  { text: '位置', value: '📍' },
  { text: '时间', value: '⏰' },
  { text: '电话', value: '📞' },
  { text: '其他', value: '📋' }
]

// 颜色选项
const colorOptions = [
  '#2ed573', '#1989fa', '#07c160', '#ff976a', '#ed4014',
  '#19be6b', '#f90', '#515a6e', '#17233d', '#2d8cf0',
  '#ff9900', '#00d0b6', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#000000'
]

// 获取账户类型文本
const getAccountTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    cash: '现金',
    bank: '银行卡',
    digital: '数字钱包'
  }
  return typeMap[type] || type
}

// 查看账户详情
const viewAccountDetail = (account: Account) => {
  selectedAccount.value = account
  showAccountDetail.value = true
}

// 编辑账户
const editAccount = (account: Account) => {
  editingAccount.value = account
  formData.name = account.name
  formData.type = account.type
  formData.typeText = getAccountTypeText(account.type)
  formData.icon = account.icon
  formData.iconText = iconOptions.find(icon => icon.value === account.icon)?.text || '其他'
  formData.color = account.color
  formData.balance = account.balance.toString()
  formData.isDefault = account.isDefault || false
  showAddDialog.value = true
}

// 删除账户
const deleteAccount = (account: Account) => {
  if (account.isDefault) {
    showToast('默认账户不能删除')
    return
  }
  deletingAccountId.value = account.id
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    await recordStore.deleteAccount(deletingAccountId.value)
    showToast('删除成功')
  } catch (error) {
    console.error('删除账户失败:', error)
    showToast('删除失败')
  }
}

// 保存账户
const saveAccount = async () => {
  if (!formData.name.trim()) {
    showToast('请输入账户名称')
    return
  }

  const balance = parseFloat(formData.balance) || 0

  try {
    const accountData = {
      name: formData.name.trim(),
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
      balance,
      isDefault: formData.isDefault
    }

    if (editingAccount.value) {
      // 编辑模式
      await recordStore.updateAccount(editingAccount.value.id, accountData)
      showToast('更新成功')
    } else {
      // 添加模式
      await recordStore.addAccount(accountData)
      showToast('添加成功')
    }

    resetForm()
    showAddDialog.value = false
  } catch (error) {
    console.error('保存账户失败:', error)
    showToast('保存失败')
  }
}

// 账户类型选择确认
const onTypeConfirm = ({ selectedOptions }: any) => {
  formData.type = selectedOptions[0].value
  formData.typeText = selectedOptions[0].text
  showTypePicker.value = false
}

// 选择图标
const selectIcon = (icon: { text: string; value: string }) => {
  formData.icon = icon.value
  formData.iconText = icon.text
}

// 选择颜色
const selectColor = (color: string) => {
  formData.color = color
}

// 重置表单
const resetForm = () => {
  editingAccount.value = null
  formData.name = ''
  formData.type = 'cash'
  formData.typeText = '现金'
  formData.icon = '💵'
  formData.iconText = '现金'
  formData.color = '#2ed573'
  formData.balance = '0'
  formData.isDefault = false
}

// 组件挂载
onMounted(async () => {
  await recordStore.loadAccounts()
})
</script>

<style scoped>
.account-manage {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 导航栏样式 */
.custom-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-actions {
  display: flex;
  align-items: center;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 主要内容区域 */
.account-content {
  padding: 16px;
  padding-top: 20px;
}

/* 资产概览卡片 */
.assets-overview {
  margin-bottom: 24px;
}

.assets-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.assets-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.assets-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.assets-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.assets-info {
  flex: 1;
}

.assets-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.assets-amount {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
}

.assets-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 16px;
}

/* 账户列表区域 */
.accounts-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.account-count {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

/* 账户网格 */
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.account-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.account-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.account-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-icon {
  font-size: 24px;
  line-height: 1;
}

.account-badges {
  display: flex;
  gap: 8px;
}

.card-content {
  margin-bottom: 16px;
}

.account-name {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.3;
}

.account-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.account-balance {
  font-size: 20px;
  font-weight: bold;
  color: #2ed573;
  line-height: 1.2;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.card-actions .van-button {
  flex: 1;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
}

.empty-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 16px;
}

/* 表单样式 */
  .account-form {
    padding: 20px;
    background: white;
  }

  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* 选择器样式 */
  .icon-picker,
  .color-picker {
    background: white;
    max-height: 70vh;
    overflow-y: auto;
    border-radius: 20px 20px 0 0;
  }

  .icon-picker-header,
  .color-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    border-radius: 20px 20px 0 0;
  }

  .icon-picker-header h3,
  .color-picker-header h3 {
    font-size: 18px;
    font-weight: bold;
    color: #1a1a1a;
    margin: 0;
  }

  /* 图标网格 */
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 20px;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    background: #fafafa;
  }

  .icon-item .emoji-icon {
    font-size: 28px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .icon-item:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }

  .icon-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .icon-item.active .emoji-icon {
    filter: brightness(0) invert(1);
  }

  .icon-name {
    font-size: 12px;
    text-align: center;
    font-weight: 500;
  }

  /* 颜色网格 */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    padding: 20px;
  }

  .color-item {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    position: relative;
  }

  .color-item::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .color-item:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .color-item.active {
    transform: scale(1.15);
    border-color: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.5);
  }

  .color-item.active::after {
    opacity: 1;
  }

  /* 账户详情 */
  .account-detail {
    padding: 20px;
    background: white;
    height: 100%;
    border-radius: 20px 20px 0 0;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
  }

  .detail-header h3 {
    font-size: 20px;
    font-weight: bold;
    color: #1a1a1a;
    margin: 0;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-item .label {
    font-size: 15px;
    color: #666;
    font-weight: 500;
  }

  .detail-item .value {
    font-size: 15px;
    color: #1a1a1a;
    font-weight: 600;
  }

/* 移除硬编码的深色主题样式，使用主题变量系统 */

/* 响应式设计 */
  @media (max-width: 768px) {
    .account-content {
      padding: 12px;
    }

    .assets-card {
      padding: 20px;
    }

    .assets-amount {
      font-size: 28px;
    }

    .assets-stats {
      flex-direction: column;
      gap: 12px;
    }

    .stat-divider {
      width: 100%;
      height: 1px;
      margin: 0;
    }

    .accounts-section {
      padding: 16px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .account-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .account-card {
      padding: 16px;
    }

    .card-header {
      margin-bottom: 12px;
    }

    .account-avatar {
      width: 48px;
      height: 48px;
    }

    .avatar-icon {
      font-size: 20px;
    }

    .card-content {
      margin-bottom: 12px;
    }

    .account-name {
      font-size: 16px;
    }

    .account-balance {
      font-size: 18px;
    }

    .card-actions {
      padding-top: 12px;
    }

    .icon-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 16px;
    }

    .icon-item {
      padding: 12px 8px;
    }

    .icon-item .emoji-icon {
      font-size: 24px;
    }

    .color-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      padding: 16px;
    }

    .color-item {
      width: 40px;
      height: 40px;
    }

    .empty-state {
      padding: 30px 16px;
    }
  }

  @media (max-width: 480px) {
    .nav-actions .add-btn {
      font-size: 12px;
      padding: 0 12px;
    }

    .assets-amount {
      font-size: 24px;
    }

    .account-avatar {
      width: 40px;
      height: 40px;
    }

    .avatar-icon {
      font-size: 18px;
    }

    .account-name {
      font-size: 15px;
    }

    .account-balance {
      font-size: 16px;
    }

    .icon-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .color-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>