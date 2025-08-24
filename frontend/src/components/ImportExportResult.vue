<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '400px' }"
    round
    closeable
    @close="handleClose"
    @update:show="$emit('update:visible', $event)"
  >
    <div class="result-container">
      <!-- 标题区域 -->
      <div class="result-header">
        <van-icon
          :name="isSuccess ? 'success' : 'warning-o'"
          :color="isSuccess ? '#07c160' : '#ff976a'"
          size="48"
        />
        <h3 class="result-title">{{ title }}</h3>
      </div>

      <!-- 统计信息 -->
      <div v-if="stats" class="result-stats">
        <div class="stats-grid">
          <div v-if="stats.categoriesImported > 0" class="stat-item">
            <span class="stat-label">分类导入</span>
            <span class="stat-value success">{{ stats.categoriesImported }}</span>
          </div>
          <div v-if="stats.categoriesSkipped > 0" class="stat-item">
            <span class="stat-label">分类跳过</span>
            <span class="stat-value warning">{{ stats.categoriesSkipped }}</span>
          </div>
          <div v-if="stats.accountsImported > 0" class="stat-item">
            <span class="stat-label">账户导入</span>
            <span class="stat-value success">{{ stats.accountsImported }}</span>
          </div>
          <div v-if="stats.accountsSkipped > 0" class="stat-item">
            <span class="stat-label">账户跳过</span>
            <span class="stat-value warning">{{ stats.accountsSkipped }}</span>
          </div>
          <div v-if="stats.recordsImported > 0" class="stat-item">
            <span class="stat-label">记录导入</span>
            <span class="stat-value success">{{ stats.recordsImported }}</span>
          </div>
          <div v-if="stats.recordsSkipped > 0" class="stat-item">
            <span class="stat-label">记录跳过</span>
            <span class="stat-value warning">{{ stats.recordsSkipped }}</span>
          </div>
        </div>

        <!-- 总计信息 -->
        <div class="total-info">
          <div class="total-item">
            <span>总计导入：</span>
            <span class="total-value success">
              {{ (stats.categoriesImported || 0) + (stats.accountsImported || 0) + (stats.recordsImported || 0) }} 项
            </span>
          </div>
          <div v-if="totalSkipped > 0" class="total-item">
            <span>总计跳过：</span>
            <span class="total-value warning">{{ totalSkipped }} 项</span>
          </div>
        </div>
      </div>

      <!-- 导出信息 -->
      <div v-if="exportInfo" class="export-info">
        <div class="export-item">
          <van-icon name="folder-o" size="16" />
          <span>文件名：{{ exportInfo.filename }}</span>
        </div>
        <div class="export-item">
          <van-icon name="clock-o" size="16" />
          <span>导出时间：{{ exportInfo.time }}</span>
        </div>
        <div v-if="exportInfo.size" class="export-item">
          <van-icon name="description" size="16" />
          <span>文件大小：{{ exportInfo.size }}</span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="stats?.errors && stats.errors.length > 0" class="error-section">
        <div class="error-header" @click="showErrors = !showErrors">
          <van-icon name="warning-o" color="#ff976a" size="16" />
          <span>发现 {{ stats.errors.length }} 个问题</span>
          <van-icon
            :name="showErrors ? 'arrow-up' : 'arrow-down'"
            size="14"
            color="#999"
          />
        </div>
        <van-collapse :model-value="showErrors ? ['errors'] : []" @update:model-value="showErrors = $event.includes('errors')">
          <van-collapse-item name="errors">
            <div class="error-list">
              <div v-for="(error, index) in stats.errors" :key="index" class="error-item">
                <van-icon name="info-o" size="12" color="#ff976a" />
                <span>{{ error }}</span>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 操作按钮 -->
      <div class="result-actions">
        <van-button
          v-if="!isSuccess"
          type="default"
          size="large"
          @click="handleRetry"
        >
          重试
        </van-button>
        <van-button
          type="primary"
          size="large"
          @click="handleClose"
        >
          {{ isSuccess ? '完成' : '关闭' }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Popup as VanPopup,
  Icon as VanIcon,
  Button as VanButton,
  Collapse as VanCollapse,
  CollapseItem as VanCollapseItem
} from 'vant'

interface ImportStats {
  categoriesImported?: number
  categoriesSkipped?: number
  accountsImported?: number
  accountsSkipped?: number
  recordsImported?: number
  recordsSkipped?: number
  errors?: string[]
}

interface ExportInfo {
  filename: string
  time: string
  size?: string
}

interface Props {
  visible: boolean
  isSuccess: boolean
  title: string
  stats?: ImportStats
  exportInfo?: ExportInfo
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'retry'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showErrors = ref(false)

const totalSkipped = computed(() => {
  if (!props.stats) return 0
  return (props.stats.categoriesSkipped || 0) + 
         (props.stats.accountsSkipped || 0) + 
         (props.stats.recordsSkipped || 0)
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.result-container {
  padding: 24px;
  text-align: center;
}

.result-header {
  margin-bottom: 24px;
}

.result-title {
  margin: 12px 0 0 0;
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.result-stats {
  margin-bottom: 24px;
  text-align: left;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 14px;
}

.stat-label {
  color: #646566;
}

.stat-value {
  font-weight: 600;
}

.stat-value.success {
  color: #07c160;
}

.stat-value.warning {
  color: #ff976a;
}

.total-info {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #1989fa;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
}

.total-item:last-child {
  margin-bottom: 0;
}

.total-value {
  font-weight: 600;
}

.total-value.success {
  color: #07c160;
}

.total-value.warning {
  color: #ff976a;
}

.export-info {
  margin-bottom: 24px;
  text-align: left;
}

.export-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #646566;
}

.export-item:last-child {
  margin-bottom: 0;
}

.error-section {
  margin-bottom: 24px;
  text-align: left;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
  color: #ff976a;
}

.error-list {
  max-height: 120px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: #646566;
  line-height: 1.4;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.result-actions .van-button {
  flex: 1;
}
</style>