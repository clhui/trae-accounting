<template>
  <div class="account-manage">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="账户管理"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-button
          type="primary"
          size="small"
          @click="showAddDialog = true"
        >
          添加
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 账户列表 -->
    <div class="account-content">
      <!-- 总资产 -->
      <div class="total-assets">
        <div class="assets-label">总资产</div>
        <div class="assets-amount">{{ formatAmount(totalAssets) }}</div>
      </div>

      <!-- 账户列表 -->
      <div class="account-list">
        <van-empty v-if="recordStore.accounts.length === 0" description="暂无账户" />
        <div v-else class="account-items">
          <div
            v-for="account in recordStore.accounts"
            :key="account.id"
            class="account-item"
            @click="viewAccountDetail(account)"
          >
            <div class="account-info">
              <div class="account-icon" :style="{ backgroundColor: account.color }">
                <van-icon :name="account.icon" color="white" size="20" />
              </div>
              <div class="account-details">
                <div class="account-name">
                  {{ account.name }}
                  <van-tag v-if="account.isDefault" type="primary" size="mini">
                    默认
                  </van-tag>
                </div>
                <div class="account-type">{{ getAccountTypeText(account.type) }}</div>
              </div>
            </div>
            <div class="account-balance">
              <div class="balance-amount">{{ formatAmount(account.balance) }}</div>
              <div class="account-actions">
                <van-button
                  type="primary"
                  size="mini"
                  @click.stop="editAccount(account)"
                >
                  编辑
                </van-button>
                <van-button
                  type="danger"
                  size="mini"
                  @click.stop="deleteAccount(account)"
                  :disabled="account.isDefault"
                >
                  删除
                </van-button>
              </div>
            </div>
          </div>
        </div>
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
            <van-icon :name="icon.value" size="24" />
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
  icon: 'cash',
  iconText: '现金',
  color: '#2ed573',
  balance: '0',
  isDefault: false
})

// 计算属性
const totalAssets = computed(() => {
  return recordStore.accounts.reduce((total, account) => total + account.balance, 0)
})

// 账户类型选项
const typeColumns = [
  { text: '现金', value: 'cash' },
  { text: '银行卡', value: 'bank' },
  { text: '数字钱包', value: 'digital' }
]

// 图标选项
const iconOptions = [
  { text: '现金', value: 'cash' },
  { text: '银行卡', value: 'credit-pay' },
  { text: '支付宝', value: 'alipay' },
  { text: '微信', value: 'wechat-pay' },
  { text: '钱包', value: 'bag-o' },
  { text: '金币', value: 'gold-coin-o' },
  { text: '礼品', value: 'gift-o' },
  { text: '购物车', value: 'shopping-cart-o' },
  { text: '星星', value: 'star-o' },
  { text: '心形', value: 'like-o' },
  { text: '设置', value: 'setting-o' },
  { text: '位置', value: 'location-o' },
  { text: '时间', value: 'clock-o' },
  { text: '电话', value: 'phone-o' },
  { text: '其他', value: 'ellipsis' }
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
  formData.icon = 'cash'
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
  background-color: #f8f9fa;
}

.account-content {
  padding: 16px;
}

.total-assets {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 16px;
  color: white;
}

.assets-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.assets-amount {
  font-size: 28px;
  font-weight: bold;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.account-item:hover {
  transform: translateY(-2px);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-type {
  font-size: 12px;
  color: #666;
}

.account-balance {
  text-align: right;
}

.balance-amount {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.account-actions {
  display: flex;
  gap: 8px;
}

.account-form {
  padding: 16px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ddd;
}

.icon-picker,
.color-picker {
  background: white;
  max-height: 60vh;
  overflow-y: auto;
}

.icon-picker-header,
.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: #f5f5f5;
}

.icon-item.active {
  background-color: #1989fa;
  color: white;
}

.icon-name {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 16px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.3);
}

.account-detail {
  padding: 16px;
  background: white;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item .label {
  font-size: 14px;
  color: #666;
}

.detail-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .account-manage {
    background-color: #1a1a1a;
  }

  .account-item {
    background: #2a2a2a;
    color: #fff;
  }

  .account-name {
    color: #fff;
  }

  .account-type {
    color: #999;
  }

  .balance-amount {
    color: #fff;
  }

  .icon-picker,
  .color-picker,
  .account-detail {
    background: #2a2a2a;
    color: #fff;
  }

  .icon-picker-header,
  .color-picker-header,
  .detail-header {
    border-bottom-color: #444;
  }

  .icon-item:hover {
    background-color: #444;
  }

  .detail-item {
    border-bottom-color: #444;
  }

  .detail-item .value {
    color: #fff;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .account-content {
    padding: 12px;
  }

  .total-assets {
    padding: 20px;
  }

  .assets-amount {
    font-size: 24px;
  }

  .account-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .account-balance {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .color-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>