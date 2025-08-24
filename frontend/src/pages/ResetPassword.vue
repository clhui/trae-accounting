<template>
  <div class="reset-password-page">
    <!-- 顶部标题 -->
    <div class="header">
      <van-nav-bar
        title="重置密码"
        left-text="返回"
        left-arrow
        @click-left="$router.push('/login')"
        class="nav-bar"
      />
    </div>

    <!-- 表单容器 -->
    <div class="form-container">
      <div class="form-card">
        <!-- 重置密码表单 -->
        <div v-if="!isSuccess" class="step-content">
          <div class="step-header">
            <van-icon name="lock" class="step-icon" />
            <h2 class="step-title">设置新密码</h2>
            <p class="step-desc">请输入您的新密码，密码长度至少6位</p>
          </div>
          
          <van-form @submit="handleResetPassword" class="reset-form">
            <van-field
              v-model="newPassword"
              type="password"
              name="newPassword"
              label="新密码"
              placeholder="请输入新密码"
              :rules="[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]"
              left-icon="lock"
            />
            
            <van-field
              v-model="confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入新密码"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validateConfirmPassword }
              ]"
              left-icon="lock"
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
                重置密码
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 重置成功提示 -->
        <div v-else class="step-content">
          <div class="step-header">
            <van-icon name="success" class="step-icon success" />
            <h2 class="step-title">密码重置成功</h2>
            <p class="step-desc">
              您的密码已成功重置，请使用新密码登录。
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
              立即登录
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="footer">
      <p class="tip">
        链接已过期？
        <span class="link" @click="$router.push('/forgot-password')">重新获取重置链接</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
const route = useRoute()

// 响应式数据
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const isSuccess = ref(false)
const resetToken = ref('')

// 确认密码验证
const validateConfirmPassword = (value: string) => {
  if (value !== newPassword.value) {
    return '两次输入的密码不一致'
  }
  return true
}

// 组件挂载时获取重置令牌
onMounted(() => {
  const token = route.query.token as string
  if (!token) {
    showToast('重置链接无效')
    router.push('/forgot-password')
    return
  }
  resetToken.value = token
})

// 处理重置密码
const handleResetPassword = async () => {
  if (!newPassword.value) {
    showToast('请输入新密码')
    return
  }

  if (newPassword.value.length < 6) {
    showToast('密码至少6个字符')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    showToast('两次输入的密码不一致')
    return
  }

  if (!resetToken.value) {
    showToast('重置令牌无效')
    return
  }

  loading.value = true
  try {
    const { error } = await AuthService.resetPassword(resetToken.value, newPassword.value)
    if (error) {
      showToast(error)
    } else {
      isSuccess.value = true
      showToast('密码重置成功')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    showToast('重置失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-page {
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
}

.submit-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
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
  width: 80px;
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