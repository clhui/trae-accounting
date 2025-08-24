<template>
  <div class="forgot-password-page">
    <!-- 顶部标题 -->
    <div class="header">
      <van-nav-bar
        title="忘记密码"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
        class="nav-bar"
      />
    </div>

    <!-- 表单容器 -->
    <div class="form-container">
      <div class="form-card">
        <!-- 步骤1: 输入邮箱 -->
        <div v-if="step === 1" class="step-content">
          <div class="step-header">
            <van-icon name="envelop-o" class="step-icon" />
            <h2 class="step-title">输入邮箱地址</h2>
            <p class="step-desc">我们将向您的邮箱发送密码重置链接</p>
          </div>
          
          <van-form @submit="handleRequestReset" class="reset-form">
            <van-field
              v-model="email"
              name="email"
              label="邮箱"
              placeholder="请输入您的邮箱地址"
              type="email"
              :rules="[
                { required: true, message: '请输入邮箱地址' },
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
              ]"
              left-icon="envelop-o"
            />
            
            <div class="form-actions">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="loading"
                class="submit-btn"
              >
                发送重置链接
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 步骤2: 发送成功提示 -->
        <div v-else-if="step === 2" class="step-content">
          <div class="step-header">
            <van-icon name="success" class="step-icon success" />
            <h2 class="step-title">邮件已发送</h2>
            <p class="step-desc">
              我们已向 <strong>{{ email }}</strong> 发送了密码重置链接，
              请检查您的邮箱并点击链接重置密码。
            </p>
          </div>
          
          <div class="form-actions">
            <van-button
              round
              block
              type="primary"
              @click="$router.push('/login')"
              class="submit-btn"
            >
              返回登录
            </van-button>
            
            <van-button
              round
              block
              plain
              type="primary"
              @click="handleResend"
              :loading="loading"
              class="resend-btn"
            >
              重新发送邮件
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="footer">
      <p class="tip">
        没有收到邮件？请检查垃圾邮件文件夹，或
        <span class="link" @click="handleResend">重新发送</span>
      </p>
      <p class="tip">
        记起密码了？
        <span class="link" @click="$router.push('/login')">返回登录</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../services/auth'
import {
  showToast,
  NavBar as VanNavBar,
  Form as VanForm,
  Field as VanField,
  Button as VanButton,
  Icon as VanIcon
} from 'vant'

const router = useRouter()

// 响应式数据
const step = ref(1) // 1: 输入邮箱, 2: 发送成功
const email = ref('')
const loading = ref(false)

// 处理请求重置密码
const handleRequestReset = async () => {
  if (!email.value) {
    showToast('请输入邮箱地址')
    return
  }

  loading.value = true
  try {
    const { error } = await AuthService.requestPasswordReset(email.value)
    if (error) {
      showToast(error)
    } else {
      step.value = 2
      showToast('重置邮件已发送')
    }
  } catch (error) {
    console.error('请求密码重置失败:', error)
    showToast('发送失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理重新发送
const handleResend = async () => {
  if (step.value === 2) {
    loading.value = true
    try {
      const { error } = await AuthService.requestPasswordReset(email.value)
      if (error) {
        showToast(error)
      } else {
        showToast('重置邮件已重新发送')
      }
    } catch (error) {
      console.error('重新发送失败:', error)
      showToast('发送失败，请重试')
    } finally {
      loading.value = false
    }
  } else {
    // 如果在第一步，直接触发发送
    handleRequestReset()
  }
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

:deep(.van-nav-bar__title) {
  color: #333;
  font-weight: 600;
}

:deep(.van-nav-bar__text) {
  color: #1989fa;
}

.form-container {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.step-content {
  padding: 32px 24px;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-icon {
  font-size: 48px;
  color: #1989fa;
  margin-bottom: 16px;
}

.step-icon.success {
  color: #07c160;
}

.step-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.reset-form {
  margin-bottom: 0;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.resend-btn {
  height: 40px;
  font-size: 14px;
}

.footer {
  padding: 20px;
  text-align: center;
}

.tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
  line-height: 1.5;
}

.link {
  color: rgba(255, 255, 255, 1);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.link:hover {
  color: rgba(255, 255, 255, 0.9);
}

/* 表单字段样式调整 */
:deep(.van-field) {
  margin-bottom: 16px;
}

:deep(.van-field__label) {
  width: 60px;
  font-weight: 500;
}

:deep(.van-field__left-icon) {
  margin-right: 8px;
  color: #969799;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .form-container {
    padding: 20px 16px;
  }
  
  .step-content {
    padding: 24px 20px;
  }
  
  .step-title {
    font-size: 20px;
  }
  
  .step-icon {
    font-size: 40px;
  }
}
</style>