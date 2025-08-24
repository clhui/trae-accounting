<template>
  <div class="help">
    <!-- 顶部导航 -->
    <van-nav-bar 
      :title="t('help.title')" 
      left-arrow 
      @click-left="$router.back()"
      fixed 
    />

    <div class="help-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          :placeholder="t('help.searchPlaceholder')"
          @search="onSearch"
        />
      </div>

      <!-- 快速导航 -->
      <div class="quick-nav" v-if="!searchKeyword">
        <div class="nav-title">{{ t('help.quickNav') }}</div>
        <div class="nav-grid">
          <div 
            class="nav-item" 
            v-for="item in quickNavItems" 
            :key="item.id"
            @click="scrollToSection(item.id)"
          >
            <van-icon :name="item.icon" />
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- 帮助内容 -->
      <div class="help-sections">
        <!-- 基础功能 -->
        <div class="help-section" id="basic-features" v-show="shouldShowSection('basic-features')">
          <div class="section-title">
            <van-icon name="apps-o" />
            {{ t('help.basicFeatures') }}
          </div>
          <div class="section-content">
            <van-collapse v-model="activeBasic">
              <van-collapse-item :title="t('help.addRecord')" name="1">
                <div class="help-item">
                  <p>{{ t('help.addRecordDesc') }}</p>
                  <ol>
                    <li>{{ t('help.addRecordStep1') }}</li>
                    <li>{{ t('help.addRecordStep2') }}</li>
                    <li>{{ t('help.addRecordStep3') }}</li>
                    <li>{{ t('help.addRecordStep4') }}</li>
                  </ol>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.viewRecords')" name="2">
                <div class="help-item">
                  <p>{{ t('help.viewRecordsDesc') }}</p>
                  <ul>
                    <li>{{ t('help.viewRecordsFeature1') }}</li>
                    <li>{{ t('help.viewRecordsFeature2') }}</li>
                    <li>{{ t('help.viewRecordsFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.statistics')" name="3">
                <div class="help-item">
                  <p>{{ t('help.statisticsDesc') }}</p>
                  <ul>
                    <li>{{ t('help.statisticsFeature1') }}</li>
                    <li>{{ t('help.statisticsFeature2') }}</li>
                    <li>{{ t('help.statisticsFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 高级功能 -->
        <div class="help-section" id="advanced-features" v-show="shouldShowSection('advanced-features')">
          <div class="section-title">
            <van-icon name="setting-o" />
            {{ t('help.advancedFeatures') }}
          </div>
          <div class="section-content">
            <van-collapse v-model="activeAdvanced">
              <van-collapse-item :title="t('help.categoryManagement')" name="1">
                <div class="help-item">
                  <p>{{ t('help.categoryManagementDesc') }}</p>
                  <ul>
                    <li>{{ t('help.categoryFeature1') }}</li>
                    <li>{{ t('help.categoryFeature2') }}</li>
                    <li>{{ t('help.categoryFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.accountManagement')" name="2">
                <div class="help-item">
                  <p>{{ t('help.accountManagementDesc') }}</p>
                  <ul>
                    <li>{{ t('help.accountFeature1') }}</li>
                    <li>{{ t('help.accountFeature2') }}</li>
                    <li>{{ t('help.accountFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.cloudSync')" name="3">
                <div class="help-item">
                  <p>{{ t('help.cloudSyncDesc') }}</p>
                  <ul>
                    <li>{{ t('help.cloudSyncFeature1') }}</li>
                    <li>{{ t('help.cloudSyncFeature2') }}</li>
                    <li>{{ t('help.cloudSyncFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.dataManagement')" name="4">
                <div class="help-item">
                  <p>{{ t('help.dataManagementDesc') }}</p>
                  <ul>
                    <li>{{ t('help.dataFeature1') }}</li>
                    <li>{{ t('help.dataFeature2') }}</li>
                    <li>{{ t('help.dataFeature3') }}</li>
                  </ul>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="help-section" id="faq" v-show="shouldShowSection('faq')">
          <div class="section-title">
            <van-icon name="question-o" />
            {{ t('help.faq') }}
          </div>
          <div class="section-content">
            <van-collapse v-model="activeFaq">
              <van-collapse-item :title="t('help.faqQ1')" name="1">
                <div class="help-item">
                  <p>{{ t('help.faqA1') }}</p>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.faqQ2')" name="2">
                <div class="help-item">
                  <p>{{ t('help.faqA2') }}</p>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.faqQ3')" name="3">
                <div class="help-item">
                  <p>{{ t('help.faqA3') }}</p>
                </div>
              </van-collapse-item>
              
              <van-collapse-item :title="t('help.faqQ4')" name="4">
                <div class="help-item">
                  <p>{{ t('help.faqA4') }}</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 联系我们 -->
        <div class="help-section" id="contact" v-show="shouldShowSection('contact')">
          <div class="section-title">
            <van-icon name="service-o" />
            {{ t('help.contact') }}
          </div>
          <div class="section-content">
            <div class="contact-info">
              <div class="contact-item">
                <van-icon name="envelop-o" />
                <span>{{ t('help.email') }}: support@example.com</span>
              </div>
              <div class="contact-item">
                <van-icon name="chat-o" />
                <span>{{ t('help.feedback') }}</span>
                <van-button 
                  type="primary" 
                  size="small" 
                  @click="$router.push('/feedback')"
                >
                  {{ t('help.submitFeedback') }}
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NavBar as VanNavBar,
  Search as VanSearch,
  Icon as VanIcon,
  Collapse as VanCollapse,
  CollapseItem as VanCollapseItem,
  Button as VanButton
} from 'vant'

const { t } = useI18n()

// 响应式数据
const searchKeyword = ref('')
const activeBasic = ref([])
const activeAdvanced = ref([])
const activeFaq = ref([])

// 快速导航项
const quickNavItems = computed(() => [
  {
    id: 'basic-features',
    title: t('help.basicFeatures'),
    icon: 'apps-o'
  },
  {
    id: 'advanced-features',
    title: t('help.advancedFeatures'),
    icon: 'setting-o'
  },
  {
    id: 'faq',
    title: t('help.faq'),
    icon: 'question-o'
  },
  {
    id: 'contact',
    title: t('help.contact'),
    icon: 'service-o'
  }
])

// 方法
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const onSearch = (value: string) => {
  // 搜索功能可以在后续扩展
  console.log('搜索:', value)
}

const shouldShowSection = (sectionId: string) => {
  if (!searchKeyword.value) return true
  
  // 简单的搜索匹配逻辑
  const keyword = searchKeyword.value.toLowerCase()
  const sectionTexts = {
    'basic-features': t('help.basicFeatures'),
    'advanced-features': t('help.advancedFeatures'),
    'faq': t('help.faq'),
    'contact': t('help.contact')
  }
  
  return sectionTexts[sectionId as keyof typeof sectionTexts]?.toLowerCase().includes(keyword)
}
</script>

<style scoped>
.help {
  min-height: 100vh;
  background-color: var(--van-background-color);
}

.help-content {
  padding: 46px 0 20px;
}

.search-section {
  padding: 16px;
  background-color: var(--van-background-color-light);
}

.quick-nav {
  padding: 16px;
  background-color: var(--van-background-color-light);
  margin-bottom: 8px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--van-text-color);
  margin-bottom: 12px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: var(--van-background-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--van-border-color);
}

.nav-item:hover {
  background-color: var(--van-primary-color-light);
  transform: translateY(-2px);
}

.nav-item .van-icon {
  font-size: 24px;
  color: var(--van-primary-color);
  margin-bottom: 8px;
}

.nav-item span {
  font-size: 14px;
  color: var(--van-text-color);
  text-align: center;
}

.help-sections {
  padding: 0 16px;
}

.help-section {
  margin-bottom: 20px;
  background-color: var(--van-background-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--van-text-color);
  background-color: var(--van-primary-color-light);
  border-bottom: 1px solid var(--van-border-color);
}

.section-title .van-icon {
  font-size: 20px;
  color: var(--van-primary-color);
  margin-right: 8px;
}

.section-content {
  padding: 0;
}

.help-item {
  padding: 16px;
  line-height: 1.6;
}

.help-item p {
  margin-bottom: 12px;
  color: var(--van-text-color-2);
}

.help-item ol,
.help-item ul {
  margin: 0;
  padding-left: 20px;
}

.help-item li {
  margin-bottom: 8px;
  color: var(--van-text-color-3);
}

.contact-info {
  padding: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--van-border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .van-icon {
  font-size: 16px;
  color: var(--van-primary-color);
  margin-right: 8px;
}

.contact-item span {
  flex: 1;
  color: var(--van-text-color-2);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .nav-item {
    padding: 12px 8px;
  }
  
  .nav-item .van-icon {
    font-size: 20px;
  }
  
  .nav-item span {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 16px;
    padding: 12px 16px;
  }
  
  .help-item {
    padding: 12px 16px;
  }
}
</style>