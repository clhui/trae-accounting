<template>
  <div class="settings">
    <!-- 顶部导航 -->
    <van-nav-bar :title="t('settings.title')" fixed />

    <div class="settings-content">
      <!-- 应用设置 -->
      <div class="settings-section">
        <div class="section-title">{{ t('settings.appSettings') }}</div>
        
        <van-cell-group>
          <van-cell
            :title="t('settings.theme')"
            :value="themeText"
            is-link
            @click="showThemePicker = true"
          />
          
          <van-cell
            :title="t('settings.currency')"
            :value="settingsStore.currency"
            is-link
            @click="showCurrencyPicker = true"
          />
          
          <van-cell
            :title="t('settings.language')"
            :value="languageText"
            is-link
            @click="showLanguagePicker = true"
          />
        </van-cell-group>
      </div>

      <!-- 功能设置 -->
      <div class="settings-section">
        <div class="section-title">{{ t('settings.functionSettings') }}</div>
        
        <van-cell-group>
          <van-cell :title="t('settings.autoBackup')">
            <template #right-icon>
              <van-switch 
                v-model="settingsStore.autoBackup" 
                @change="onAutoBackupChange"
                size="20px"
              />
            </template>
          </van-cell>
          
          <van-cell :title="t('settings.budgetAlert')">
            <template #right-icon>
              <van-switch 
                v-model="settingsStore.budgetAlert" 
                @change="onBudgetAlertChange"
                size="20px"
              />
            </template>
          </van-cell>
          
          <van-cell
            :title="t('settings.categoryManagement')"
            is-link
            @click="$router.push('/category-manage')"
          />
          
          <van-cell
            :title="t('settings.accountManagement')"
            is-link
            @click="$router.push('/account-manage')"
          />
        </van-cell-group>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <div class="section-title">{{ t('settings.dataManagement') }}</div>
        
        <van-cell-group>
          <van-cell
            :title="t('settings.exportData')"
            is-link
            @click="exportData"
            :clickable="!isLoading"
          >
            <template #right-icon>
              <van-icon v-if="!isLoading" name="down" />
              <van-loading v-else size="16px" />
            </template>
          </van-cell>
          
          <van-cell
            :title="t('settings.importData')"
            is-link
            @click="importData"
            :clickable="!isLoading"
          >
            <template #right-icon>
              <van-icon v-if="!isLoading" name="up" />
              <van-loading v-else size="16px" />
            </template>
          </van-cell>
          
          <van-cell
            :title="t('settings.clearData')"
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
        <div class="section-title">{{ t('settings.accountManagement') }}</div>
        
        <van-cell-group>
          <van-cell
            :title="t('settings.logout')"
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
        <div class="section-title">{{ t('settings.about') }}</div>
        
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
        :title="t('settings.theme')"
      />
    </van-popup>

    <!-- 货币选择器 -->
    <van-popup v-model:show="showCurrencyPicker" position="bottom">
      <van-picker
        :columns="currencyOptions"
        @confirm="onCurrencyConfirm"
        @cancel="showCurrencyPicker = false"
        :title="t('settings.currency')"
      />
    </van-popup>

    <!-- 语言选择器 -->
    <van-popup v-model:show="showLanguagePicker" position="bottom">
      <van-picker
        :columns="languageOptions"
        @confirm="onLanguageConfirm"
        @cancel="showLanguagePicker = false"
        :title="t('settings.language')"
      />
    </van-popup>

    <!-- 清空数据确认 -->
    <van-dialog
      v-model:show="showClearConfirm"
      :title="t('dialogs.clearDataTitle')"
      :message="t('dialogs.clearDataMessage')"
      show-cancel-button
      :confirm-button-text="t('common.confirm')"
      :cancel-button-text="t('common.cancel')"
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

    <!-- 导入导出结果对话框 -->
     <ImportExportResult
       :visible="showResultDialog"
       @update:visible="showResultDialog = $event"
       :is-success="resultData.isSuccess"
       :title="resultData.title"
       :stats="resultData.stats"
       :export-info="resultData.exportInfo"
       @close="handleResultClose"
       @retry="retryImport"
     />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRecordStore, useSettingsStore } from '../stores/recordStore'
import { useAuthStore } from '../stores/authStore'
import { setLanguage } from '../i18n'
import { downloadFile } from '../utils'
import ImportExportResult from '../components/ImportExportResult.vue'
import {
  NavBar as VanNavBar,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Switch as VanSwitch,
  Icon as VanIcon,
  Popup as VanPopup,
  Picker as VanPicker,
  Dialog as VanDialog,
  Loading as VanLoading,
  showToast,
  showConfirmDialog
} from 'vant'

const router = useRouter()
const { t } = useI18n()
const recordStore = useRecordStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

// 响应式数据
const showThemePicker = ref(false)
const showCurrencyPicker = ref(false)
const showLanguagePicker = ref(false)
const showClearConfirm = ref(false)
const fileInput = ref<HTMLInputElement>()
const showResultDialog = ref(false)
const isLoading = ref(false)
const resultData = ref<{
  isSuccess: boolean
  title: string
  stats?: any
  exportInfo?: any
}>({
  isSuccess: false,
  title: ''
})

// 选项数据
const themeOptions = computed(() => [
  { text: t('theme.auto'), value: 'auto' },
  { text: t('theme.light'), value: 'light' },
  { text: t('theme.dark'), value: 'dark' }
])

const currencyOptions = computed(() => [
  { text: t('currency.cny'), value: '¥' },
  { text: t('currency.usd'), value: '$' },
  { text: t('currency.eur'), value: '€' },
  { text: t('currency.gbp'), value: '£' }
])

const languageOptions = computed(() => [
  { text: t('language.zh-CN'), value: 'zh-CN' },
  { text: t('language.en-US'), value: 'en-US' }
])

// 计算属性
const themeText = computed(() => {
  const theme = themeOptions.value.find(t => t.value === settingsStore.theme)
  return theme?.text || t('theme.auto')
})

const languageText = computed(() => {
  const language = languageOptions.value.find(l => l.value === settingsStore.language)
  return language?.text || t('language.zh-CN')
})

// 生命周期
onMounted(() => {
  settingsStore.loadSettings()
})

// 方法
const onThemeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  const themeValue = selectedValues[0] as 'light' | 'dark' | 'auto'
  settingsStore.updateSettings({ theme: themeValue })
  showThemePicker.value = false
  showToast(t('messages.themeUpdated'))
}

const onCurrencyConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  settingsStore.updateSettings({ currency: selectedValues[0] })
  showCurrencyPicker.value = false
  showToast(t('messages.currencyUpdated'))
}

const onLanguageConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  const newLanguage = selectedValues[0] as any
  settingsStore.updateSettings({ language: newLanguage })
  setLanguage(newLanguage)
  showLanguagePicker.value = false
  showToast(t('messages.languageUpdated'))
}

const onAutoBackupChange = (value: boolean) => {
  settingsStore.updateSettings({ autoBackup: value })
  showToast(value ? t('messages.autoBackupEnabled') : t('messages.autoBackupDisabled'))
}

const onBudgetAlertChange = (value: boolean) => {
  settingsStore.updateSettings({ budgetAlert: value })
  showToast(value ? t('messages.budgetAlertEnabled') : t('messages.budgetAlertDisabled'))
}

const exportData = async () => {
  let loadingToast: any = null
  try {
    isLoading.value = true
    loadingToast = showToast({
      message: '正在导出数据...',
      type: 'loading',
      duration: 0,
      forbidClick: true
    })
    
    const data = await recordStore.exportData()
    const now = new Date()
    const filename = `记账数据导出_${now.toISOString().split('T')[0]}.json`
    downloadFile(data, filename)
    
    // 关闭加载提示
    if (loadingToast) loadingToast.close()
    
    // 显示详细的导出成功信息
    resultData.value = {
      isSuccess: true,
      title: t('messages.dataExported'),
      exportInfo: {
        filename,
        time: now.toLocaleString('zh-CN'),
        size: '已保存到下载文件夹'
      }
    }
    showResultDialog.value = true
  } catch (error) {
    console.error('导出数据失败:', error)
    if (loadingToast) loadingToast.close()
    resultData.value = {
      isSuccess: false,
      title: t('messages.exportFailed')
    }
    showResultDialog.value = true
  } finally {
    isLoading.value = false
  }
}

const importData = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.name.endsWith('.json')) {
    showToast(t('messages.invalidFileType'))
    return
  }
  
  let loadingToast: any = null
  try {
    isLoading.value = true
    loadingToast = showToast({
      message: '正在导入数据，请稍候...',
      type: 'loading',
      duration: 0,
      forbidClick: true
    })
    
    const result = await recordStore.importData(file)
    
    // 关闭加载提示
    if (loadingToast) loadingToast.close()
    
    // 显示详细的导入结果信息
    // 注意：BackendApiService.importData 返回的是后端响应的 data 部分
    // 后端结构：{success: true, data: {message: '...', stats: {...}}}
    // 所以这里 result 就是 data 部分，包含 message 和 stats
    const { stats } = result
    resultData.value = {
      isSuccess: true,
      title: t('messages.dataImported'),
      stats: {
        categoriesImported: stats.categoriesImported || 0,
        categoriesSkipped: stats.categoriesSkipped || 0,
        accountsImported: stats.accountsImported || 0,
        accountsSkipped: stats.accountsSkipped || 0,
        recordsImported: stats.recordsImported || 0,
        recordsSkipped: stats.recordsSkipped || 0,
        errors: stats.errors || []
      }
    }
    showResultDialog.value = true
  } catch (error) {
    console.error('导入数据失败:', error)
    if (loadingToast) loadingToast.close()
    resultData.value = {
      isSuccess: false,
      title: error instanceof Error ? error.message : t('messages.importFailed')
    }
    showResultDialog.value = true
  } finally {
    isLoading.value = false
    // 清空文件输入
    if (target) target.value = ''
  }
}

const clearAllData = async () => {
  try {
    await recordStore.clearAllData()
    showToast(t('common.success'))
    
    // 重新加载数据
    await recordStore.loadRecords()
    await recordStore.loadCategories()
    await recordStore.loadAccounts()
  } catch (error) {
    console.error('清空数据失败:', error)
    showToast(t('common.error'))
  }
}

const showHelp = () => {
  router.push('/help')
}

const showFeedback = () => {
  router.push('/feedback')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      cancelButtonText: t('common.cancel'),
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

const handleResultClose = () => {
  showResultDialog.value = false
}

const retryImport = () => {
  showResultDialog.value = false
  fileInput.value?.click()
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

/* 移除硬编码的暗色主题样式，使用主题变量系统 */
</style>