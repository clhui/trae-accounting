<template>
  <div class="settings">
    <!-- 顶部导航 -->
    <van-nav-bar title="设置" fixed />

    <div class="settings-content">
      <!-- 应用设置 -->
      <div class="settings-section">
        <div class="section-title">应用设置</div>
        
        <van-cell-group>
          <van-cell
            title="主题"
            :value="themeText"
            is-link
            @click="showThemePicker = true"
          />
          
          <van-cell
            title="货币单位"
            :value="settingsStore.currency"
            is-link
            @click="showCurrencyPicker = true"
          />
          
          <van-cell
            title="语言"
            :value="languageText"
            is-link
            @click="showLanguagePicker = true"
          />
        </van-cell-group>
      </div>

      <!-- 功能设置 -->
      <div class="settings-section">
        <div class="section-title">功能设置</div>
        
        <van-cell-group>
          <van-cell title="自动备份">
            <template #right-icon>
              <van-switch 
                v-model="settingsStore.autoBackup" 
                @change="onAutoBackupChange"
                size="20px"
              />
            </template>
          </van-cell>
          
          <van-cell title="预算提醒">
            <template #right-icon>
              <van-switch 
                v-model="settingsStore.budgetAlert" 
                @change="onBudgetAlertChange"
                size="20px"
              />
            </template>
          </van-cell>
          
          <van-cell
            title="分类管理"
            is-link
            @click="$router.push('/categories')"
          />
          
          <van-cell
            title="账户管理"
            is-link
            @click="$router.push('/accounts')"
          />
        </van-cell-group>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <div class="section-title">数据管理</div>
        
        <van-cell-group>
          <van-cell
            title="导出数据"
            is-link
            @click="exportData"
          >
            <template #right-icon>
              <van-icon name="down" />
            </template>
          </van-cell>
          
          <van-cell
            title="导入数据"
            is-link
            @click="importData"
          >
            <template #right-icon>
              <van-icon name="up" />
            </template>
          </van-cell>
          
          <van-cell
            title="清空数据"
            is-link
            @click="showClearConfirm = true"
          >
            <template #right-icon>
              <van-icon name="delete" color="#ff6b6b" />
            </template>
          </van-cell>
          
          <van-cell
            title="云数据库测试"
            is-link
            @click="$router.push('/cloud-test')"
          >
            <template #right-icon>
              <van-icon name="cloud-o" color="#1989fa" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 账户管理 -->
      <div class="settings-section">
        <div class="section-title">账户管理</div>
        
        <van-cell-group>
          <van-cell
            title="退出登录"
            is-link
            @click="handleLogout"
          >
            <template #right-icon>
              <van-icon name="sign" color="#ff6b6b" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <div class="section-title">关于</div>
        
        <van-cell-group>
          <van-cell
            title="版本信息"
            value="v1.0.0"
          />
          
          <van-cell
            title="使用帮助"
            is-link
            @click="showHelp"
          />
          
          <van-cell
            title="意见反馈"
            is-link
            @click="showFeedback"
          />
        </van-cell-group>
      </div>
    </div>

    <!-- 主题选择器 -->
    <van-popup v-model:show="showThemePicker" position="bottom">
      <van-picker
        :columns="themeOptions"
        @confirm="onThemeConfirm"
        @cancel="showThemePicker = false"
        title="选择主题"
      />
    </van-popup>

    <!-- 货币选择器 -->
    <van-popup v-model:show="showCurrencyPicker" position="bottom">
      <van-picker
        :columns="currencyOptions"
        @confirm="onCurrencyConfirm"
        @cancel="showCurrencyPicker = false"
        title="选择货币"
      />
    </van-popup>

    <!-- 语言选择器 -->
    <van-popup v-model:show="showLanguagePicker" position="bottom">
      <van-picker
        :columns="languageOptions"
        @confirm="onLanguageConfirm"
        @cancel="showLanguagePicker = false"
        title="选择语言"
      />
    </van-popup>

    <!-- 清空数据确认 -->
    <van-dialog
      v-model:show="showClearConfirm"
      title="清空数据"
      message="此操作将删除所有记录数据，且无法恢复。确定要继续吗？"
      show-cancel-button
      confirm-button-text="确定"
      cancel-button-text="取消"
      confirm-button-color="#ff6b6b"
      @confirm="clearAllData"
    />

    <!-- 文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecordStore, useSettingsStore } from '../stores/recordStore'
import { useAuthStore } from '../stores/authStore'
import {
  NavBar as VanNavBar,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Switch as VanSwitch,
  Icon as VanIcon,
  Popup as VanPopup,
  Picker as VanPicker,
  Dialog as VanDialog,
  showToast,
  showConfirmDialog
} from 'vant'

const router = useRouter()
const recordStore = useRecordStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

// 响应式数据
const showThemePicker = ref(false)
const showCurrencyPicker = ref(false)
const showLanguagePicker = ref(false)
const showClearConfirm = ref(false)
const fileInput = ref<HTMLInputElement>()

// 选项数据
const themeOptions = [
  { text: '跟随系统', value: 'auto' },
  { text: '浅色模式', value: 'light' },
  { text: '深色模式', value: 'dark' }
]

const currencyOptions = [
  { text: '人民币 (¥)', value: '¥' },
  { text: '美元 ($)', value: '$' },
  { text: '欧元 (€)', value: '€' },
  { text: '英镑 (£)', value: '£' }
]

const languageOptions = [
  { text: '简体中文', value: 'zh-CN' },
  { text: 'English', value: 'en-US' }
]

// 计算属性
const themeText = computed(() => {
  const theme = themeOptions.find(t => t.value === settingsStore.theme)
  return theme?.text || '跟随系统'
})

const languageText = computed(() => {
  const language = languageOptions.find(l => l.value === settingsStore.language)
  return language?.text || '简体中文'
})

// 生命周期
onMounted(() => {
  settingsStore.loadSettings()
})

// 方法
const onThemeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  settingsStore.updateSettings({ theme: selectedValues[0] as any })
  showThemePicker.value = false
  showToast('主题已更新')
}

const onCurrencyConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  settingsStore.updateSettings({ currency: selectedValues[0] })
  showCurrencyPicker.value = false
  showToast('货币单位已更新')
}

const onLanguageConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  settingsStore.updateSettings({ language: selectedValues[0] as any })
  showLanguagePicker.value = false
  showToast('语言已更新')
}

const onAutoBackupChange = (value: boolean) => {
  settingsStore.updateSettings({ autoBackup: value })
  showToast(value ? '已开启自动备份' : '已关闭自动备份')
}

const onBudgetAlertChange = (value: boolean) => {
  settingsStore.updateSettings({ budgetAlert: value })
  showToast(value ? '已开启预算提醒' : '已关闭预算提醒')
}

const exportData = async () => {
  try {
    await recordStore.exportData()
    showToast('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    showToast('导出失败，请重试')
  }
}

const importData = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    await recordStore.importData(data)
    showToast('数据导入成功')
    
    // 重新加载数据
    await recordStore.loadRecords()
    await recordStore.loadCategories()
    await recordStore.loadAccounts()
  } catch (error) {
    console.error('导入数据失败:', error)
    showToast('导入失败，请检查文件格式')
  } finally {
    // 清空文件输入
    if (target) target.value = ''
  }
}

const clearAllData = async () => {
  try {
    await recordStore.clearAllData()
    showToast('数据已清空')
    
    // 重新加载数据
    await recordStore.loadRecords()
    await recordStore.loadCategories()
    await recordStore.loadAccounts()
  } catch (error) {
    console.error('清空数据失败:', error)
    showToast('清空失败，请重试')
  }
}

const showHelp = () => {
  showToast('使用帮助功能开发中')
}

const showFeedback = () => {
  showToast('意见反馈功能开发中')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      confirmButtonColor: '#ff6b6b'
    })
    
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消或退出失败
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      showToast('退出登录失败，请重试')
    }
  }
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.settings-content {
  padding: 46px 16px 16px;
}

.settings-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
  padding: 0 4px;
}

.settings-section :deep(.van-cell-group) {
  border-radius: 8px;
  overflow: hidden;
}

.settings-section :deep(.van-cell) {
  padding: 16px;
}

.settings-section :deep(.van-cell__title) {
  font-size: 16px;
  color: #333;
}

.settings-section :deep(.van-cell__value) {
  font-size: 14px;
  color: #999;
}

.settings-section :deep(.van-cell--clickable:active) {
  background-color: #f8f9fa;
}

/* 开关样式 */
.settings-section :deep(.van-switch) {
  transform: scale(0.9);
}

.settings-section :deep(.van-switch--on) {
  background-color: #1890ff;
}

/* 图标样式 */
.settings-section :deep(.van-icon) {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .settings-content {
    padding: 46px 12px 12px;
  }
  
  .settings-section :deep(.van-cell) {
    padding: 14px 16px;
  }
  
  .settings-section :deep(.van-cell__title) {
    font-size: 15px;
  }
  
  .settings-section :deep(.van-cell__value) {
    font-size: 13px;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .settings {
    background-color: #121212;
  }
  
  .section-title {
    color: #999;
  }
  
  .settings-section :deep(.van-cell-group) {
    background-color: #1f1f1f;
  }
  
  .settings-section :deep(.van-cell) {
    background-color: #1f1f1f;
    border-bottom-color: #333;
  }
  
  .settings-section :deep(.van-cell__title) {
    color: #fff;
  }
  
  .settings-section :deep(.van-cell__value) {
    color: #999;
  }
  
  .settings-section :deep(.van-cell--clickable:active) {
    background-color: #2a2a2a;
  }
}
</style>