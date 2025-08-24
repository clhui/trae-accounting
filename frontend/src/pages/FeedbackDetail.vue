<template>
  <div class="feedback-detail">
    <!-- 顶部导航 -->
    <van-nav-bar 
      :title="t('feedback.detailTitle')" 
      left-arrow 
      @click-left="$router.back()"
      fixed 
    />

    <div class="feedback-detail-content">
      <van-loading v-if="loading" class="loading-center" />
      
      <div v-else-if="feedback" class="feedback-info">
        <!-- 基本信息 -->
        <van-cell-group>
          <van-cell 
            :title="t('feedback.type')"
            :value="getTypeLabel(feedback.type)"
          />
          <van-cell 
            :title="t('feedback.titleLabel')"
            :value="feedback.title"
          />
          <van-cell 
            :title="t('feedback.status')"
            :value="getStatusLabel(feedback.status)"
            :label="getStatusColor(feedback.status)"
          >
            <template #value>
              <van-tag 
                :type="getStatusTagType(feedback.status)"
                size="medium"
              >
                {{ getStatusLabel(feedback.status) }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell 
            :title="t('feedback.submitTime')"
            :value="formatDate(feedback.created_at)"
          />
          <van-cell 
            v-if="feedback.updated_at !== feedback.created_at"
            :title="t('feedback.updateTime')"
            :value="formatDate(feedback.updated_at)"
          />
        </van-cell-group>

        <!-- 详细描述 -->
        <div class="section">
          <div class="section-title">{{ t('feedback.descriptionLabel') }}</div>
          <div class="description-content">
            {{ feedback.description }}
          </div>
        </div>

        <!-- 联系方式 -->
        <div v-if="feedback.contact" class="section">
          <div class="section-title">{{ t('feedback.contactLabel') }}</div>
          <van-cell-group>
            <van-cell 
              :title="t('feedback.contactInfo')"
              :value="feedback.contact"
              is-link
              @click="copyToClipboard(feedback.contact)"
            >
              <template #icon>
                <van-icon name="contact" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 设备信息 -->
        <div v-if="feedback.device_info" class="section">
          <div class="section-title">{{ t('feedback.deviceInfo') }}</div>
          <van-cell-group>
            <van-cell 
              v-if="feedback.device_info.browser"
              :title="t('feedback.browser')"
              :value="getBrowserInfo(feedback.device_info.browser)"
            />
            <van-cell 
              v-if="feedback.device_info.screenSize"
              :title="t('feedback.screen')"
              :value="feedback.device_info.screenSize"
            />
            <van-cell 
              v-if="feedback.device_info.language"
              :title="t('feedback.language')"
              :value="feedback.device_info.language"
            />
            <van-cell 
              v-if="feedback.device_info.timestamp"
              :title="t('feedback.timestamp')"
              :value="formatDate(feedback.device_info.timestamp)"
            />
          </van-cell-group>
        </div>
      </div>

      <div v-else class="error-state">
        <van-empty 
          :description="t('feedback.notFound')"
          image="error"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CloudApiService } from '../services/cloudApi'
import {
  NavBar as VanNavBar,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Tag as VanTag,
  Icon as VanIcon,
  Loading as VanLoading,
  Empty as VanEmpty,
  showToast
} from 'vant'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 响应式数据
const loading = ref(true)
const feedback = ref<any>(null)

// 生命周期
onMounted(async () => {
  await loadFeedbackDetail()
})

// 方法
const loadFeedbackDetail = async () => {
  try {
    loading.value = true
    const feedbackId = route.params.id as string
    
    if (!feedbackId) {
      showToast(t('feedback.invalidId'))
      router.back()
      return
    }

    // 获取反馈历史列表，然后找到对应的反馈
    const result = await CloudApiService.getFeedbackHistory(1, 100)
    
    if (result.success && result.data) {
      const foundFeedback = result.data.find((item: any) => item.id === feedbackId)
      if (foundFeedback) {
        feedback.value = foundFeedback
      } else {
        showToast(t('feedback.notFound'))
      }
    } else {
      showToast(t('feedback.loadError'))
    }
  } catch (error) {
    console.error('加载反馈详情失败:', error)
    showToast(t('feedback.loadError'))
  } finally {
    loading.value = false
  }
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'bug_report': t('feedback.bugReport'),
    'feature_request': t('feedback.featureRequest'),
    'improvement': t('feedback.improvement'),
    'other': t('feedback.other')
  }
  return typeMap[type] || type
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': t('feedback.statusPending'),
    'in_progress': t('feedback.statusInProgress'),
    'resolved': t('feedback.statusResolved'),
    'closed': t('feedback.statusClosed')
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'warning',
    'in_progress': 'primary',
    'resolved': 'success',
    'closed': 'default'
  }
  return typeMap[status] || 'default'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': '#ff9500',
    'in_progress': '#1989fa',
    'resolved': '#07c160',
    'closed': '#969799'
  }
  return colorMap[status] || '#969799'
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

const getBrowserInfo = (userAgent: string) => {
  // 简化浏览器信息显示
  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
    return match ? `Chrome ${match[1]}` : 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
    return match ? `Firefox ${match[1]}` : 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+\.\d+)/)
    return match ? `Safari ${match[1]}` : 'Safari'
  } else if (userAgent.includes('Edge')) {
    const match = userAgent.match(/Edge\/(\d+\.\d+)/)
    return match ? `Edge ${match[1]}` : 'Edge'
  }
  return userAgent.split(' ').slice(-2).join(' ')
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
</script>

<style scoped>
.feedback-detail {
  min-height: 100vh;
  background-color: var(--van-background-color);
}

.feedback-detail-content {
  padding: 46px 0 20px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.feedback-info {
  padding-bottom: 20px;
}

.section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--van-text-color);
  padding: 16px;
  background-color: var(--van-background-color-light);
  margin: 0;
}

.description-content {
  padding: 16px;
  background-color: var(--van-background-color-light);
  color: var(--van-text-color);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-state {
  padding: 40px 20px;
  text-align: center;
}
</style>