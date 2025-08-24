<template>
  <div class="feedback">
    <!-- 顶部导航 -->
    <van-nav-bar 
      :title="t('feedback.title')" 
      left-arrow 
      @click-left="$router.back()"
      fixed 
    />

    <div class="feedback-content">
      <!-- 反馈类型选择 -->
      <div class="feedback-section">
        <div class="section-title">{{ t('feedback.type') }}</div>
        <van-radio-group v-model="feedbackForm.type">
          <van-cell-group>
            <van-cell 
              v-for="type in feedbackTypes" 
              :key="type.value"
              :title="type.label"
              clickable
              @click="feedbackForm.type = type.value"
            >
              <template #right-icon>
                <van-radio :name="type.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- 反馈表单 -->
      <div class="feedback-section">
        <div class="section-title">{{ t('feedback.details') }}</div>
        <van-form @submit="onSubmit">
          <van-cell-group>
            <!-- 标题 -->
            <van-field
              v-model="feedbackForm.title"
              :label="t('feedback.titleLabel')"
              :placeholder="t('feedback.titlePlaceholder')"
              :rules="[{ required: true, message: t('feedback.titleRequired') }]"
              maxlength="50"
              show-word-limit
            />
            
            <!-- 详细描述 -->
            <van-field
              v-model="feedbackForm.description"
              :label="t('feedback.descriptionLabel')"
              :placeholder="t('feedback.descriptionPlaceholder')"
              type="textarea"
              rows="4"
              :rules="[{ required: true, message: t('feedback.descriptionRequired') }]"
              maxlength="500"
              show-word-limit
            />
            
            <!-- 联系方式 -->
            <van-field
              v-model="feedbackForm.contact"
              :label="t('feedback.contactLabel')"
              :placeholder="t('feedback.contactPlaceholder')"
              maxlength="100"
            />
            
            <!-- 设备信息 -->
            <van-field
              :label="t('feedback.deviceInfo')"
              :value="deviceInfo"
              readonly
              @click="showDeviceInfo = true"
              is-link
            />
          </van-cell-group>
          
          <!-- 提交按钮 -->
          <div class="submit-section">
            <van-button 
              type="primary" 
              native-type="submit" 
              block 
              :loading="submitting"
              :disabled="!isFormValid"
            >
              {{ t('feedback.submit') }}
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 其他联系方式 -->
      <div class="feedback-section">
        <div class="section-title">{{ t('feedback.otherContact') }}</div>
        <van-cell-group>
          <van-cell
            :title="t('feedback.email')"
            value="support@example.com"
            is-link
            @click="copyToClipboard('support@example.com')"
          >
            <template #icon>
              <van-icon name="envelop-o" />
            </template>
          </van-cell>
          
          <van-cell
            :title="t('feedback.github')"
            :value="t('feedback.githubIssuesDesc')"
            is-link
            @click="openGithub"
          >
            <template #icon>
              <van-icon name="github-o" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 查看历史反馈按钮 -->
      <div class="feedback-section">
        <van-cell-group>
          <van-cell
            :title="t('feedback.viewHistory')"
            :value="feedbackHistory.length > 0 ? `${feedbackHistory.length} ${t('feedback.records')}` : t('feedback.noRecords')"
            is-link
            @click="openHistoryDialog"
          >
            <template #icon>
              <van-icon name="clock-o" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 历史反馈弹窗 -->
    <van-popup v-model:show="showHistoryDialog" position="bottom" style="height: 70%">
      <div class="history-popup">
        <div class="popup-header">
          <h3>{{ t('feedback.historyTitle') }}</h3>
          <van-button 
            type="primary" 
            size="small" 
            @click="showHistoryDialog = false"
          >
            {{ t('common.close') }}
          </van-button>
        </div>
        <div class="history-content">
          <div v-if="feedbackHistory.length === 0" class="empty-state">
            <van-icon name="comment-o" size="48" color="#ddd" />
            <p>{{ t('feedback.noHistoryRecords') }}</p>
          </div>
          <van-cell-group v-else>
            <van-cell
              v-for="item in feedbackHistory"
              :key="item.id"
              :title="item.title"
              :label="item.date"
              :value="item.status"
              is-link
              @click="viewFeedback(item)"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 设备信息弹窗 -->
    <van-popup v-model:show="showDeviceInfo" position="bottom">
      <div class="device-info-popup">
        <div class="popup-header">
          <h3>{{ t('feedback.deviceInfoTitle') }}</h3>
          <van-button 
            type="primary" 
            size="small" 
            @click="copyDeviceInfo"
          >
            {{ t('feedback.copy') }}
          </van-button>
        </div>
        <div class="device-info-content">
          <div class="info-item">
            <span class="label">{{ t('feedback.browser') }}:</span>
            <span class="value">{{ deviceInfo }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('feedback.screen') }}:</span>
            <span class="value">{{ screenInfo }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('feedback.timestamp') }}:</span>
            <span class="value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
        <van-button 
          block 
          @click="showDeviceInfo = false"
        >
          {{ t('common.close') }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CloudApiService } from '../services/cloudApi'
import {
  NavBar as VanNavBar,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Form as VanForm,
  Field as VanField,
  Button as VanButton,
  Icon as VanIcon,
  Popup as VanPopup,
  showToast,
  showSuccessToast
} from 'vant'

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const submitting = ref(false)
const showDeviceInfo = ref(false)
const showHistoryDialog = ref(false)

// 反馈表单
const feedbackForm = ref({
  type: 'bug_report',
  title: '',
  description: '',
  contact: ''
})

// 反馈类型
const feedbackTypes = computed(() => [
  { value: 'bug_report', label: t('feedback.bugReport') },
  { value: 'feature_request', label: t('feedback.featureRequest') },
  { value: 'improvement', label: t('feedback.improvement') },
  { value: 'other', label: t('feedback.other') }
])

// 反馈历史
const feedbackHistory = ref([])

// 设备信息
const deviceInfo = computed(() => {
  return navigator.userAgent.split(' ').slice(-2).join(' ')
})

const screenInfo = computed(() => {
  return `${window.screen.width}x${window.screen.height}`
})

// 表单验证
const isFormValid = computed(() => {
  return feedbackForm.value.title.trim() && feedbackForm.value.description.trim()
})

// 生命周期
onMounted(() => {
  // 加载反馈历史
  loadFeedbackHistory()
})

// 方法
const onSubmit = async () => {
  if (!isFormValid.value) {
    showToast(t('feedback.formInvalid'))
    return
  }

  submitting.value = true
  
  try {
    // 构建反馈数据
    const feedbackData = {
      type: feedbackForm.value.type,
      title: feedbackForm.value.title,
      description: feedbackForm.value.description,
      contact: feedbackForm.value.contact,
      device_info: {
        browser: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timestamp: new Date().toISOString()
      }
    }
    
    // 提交反馈到云数据库
    const result = await CloudApiService.submitFeedback(feedbackData)
    
    if (!result.success) {
      throw new Error(result.message)
    }
    
    // 显示成功消息
    showSuccessToast(t('feedback.submitSuccess'))
    
    // 重置表单
    feedbackForm.value = {
      type: 'bug_report',
      title: '',
      description: '',
      contact: ''
    }
    
    // 重新加载反馈历史
    await loadFeedbackHistory()
    
  } catch (error) {
    console.error('提交反馈失败:', error)
    showToast(t('feedback.submitError'))
  } finally {
    submitting.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast(t('feedback.copied'))
  } catch (error) {
    console.error('复制失败:', error)
    showToast(t('feedback.copyError'))
  }
}

const copyDeviceInfo = async () => {
  const info = `浏览器: ${deviceInfo.value}\n屏幕: ${screenInfo.value}\n时间: ${new Date().toLocaleString()}`
  await copyToClipboard(info)
}

const openGithub = () => {
  window.open('https://github.com/clhui/trae-accounting/issues', '_blank')
}

const viewFeedback = (item: any) => {
  router.push({ name: 'FeedbackDetail', params: { id: item.id } })
}

const openHistoryDialog = async () => {
  // 打开弹窗前重新加载反馈历史
  await loadFeedbackHistory()
  showHistoryDialog.value = true
}

const loadFeedbackHistory = async () => {
  // 从云数据库加载反馈历史
  try {
    const result = await CloudApiService.getFeedbackHistory()
    
    if (result.success && result.data) {
      feedbackHistory.value = result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        date: new Date(item.created_at).toLocaleDateString(),
        status: item.status === 'pending' ? t('feedback.statusPending') : 
                item.status === 'in_progress' ? t('feedback.statusInProgress') :
                item.status === 'resolved' ? t('feedback.statusResolved') :
                item.status === 'closed' ? t('feedback.statusClosed') : item.status
      }))
    } else {
      feedbackHistory.value = []
    }
  } catch (error) {
    console.error('加载反馈历史失败:', error)
    // 如果云服务不可用，显示空历史
    feedbackHistory.value = []
  }
}
</script>

<style scoped>
.feedback {
  min-height: 100vh;
  background-color: var(--van-background-color);
}

.feedback-content {
  padding: 46px 0 20px;
}

.feedback-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--van-text-color);
  padding: 16px;
  background-color: var(--van-background-color-light);
  margin: 0;
}

.submit-section {
  padding: 20px 16px;
}

.device-info-popup {
  padding: 20px;
  background-color: var(--van-background-color-light);
}

.history-popup {
  padding: 20px;
  background-color: var(--van-background-color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-content {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--van-text-color-3);
}

.empty-state p {
  margin: 16px 0 0;
  font-size: 14px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--van-text-color);
}

.device-info-content {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--van-border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: var(--van-text-color-2);
  min-width: 80px;
}

.info-item .value {
  color: var(--van-text-color-3);
  text-align: right;
  flex: 1;
  margin-left: 16px;
  word-break: break-all;
}

/* 表单样式 */
.feedback-section :deep(.van-cell-group) {
  margin: 0;
}

.feedback-section :deep(.van-field__label) {
  font-weight: 600;
  color: var(--van-text-color-2);
}

.feedback-section :deep(.van-field__control) {
  color: var(--van-text-color);
}

.feedback-section :deep(.van-field__word-limit) {
  color: var(--van-text-color-3);
}

/* 单选框样式 */
.feedback-section :deep(.van-radio__icon--checked) {
  background-color: var(--van-primary-color);
  border-color: var(--van-primary-color);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .section-title {
    font-size: 14px;
    padding: 12px 16px;
  }
  
  .submit-section {
    padding: 16px;
  }
  
  .device-info-popup {
    padding: 16px;
  }
  
  .popup-header h3 {
    font-size: 16px;
  }
  
  .info-item .label {
    min-width: 60px;
    font-size: 14px;
  }
  
  .info-item .value {
    font-size: 14px;
  }
}
</style>