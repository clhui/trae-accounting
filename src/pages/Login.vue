<template>
  <div class="login-page">
    <!-- 顶部标题 -->
    <div class="header">
      <h1 class="title">记账本</h1>
      <p class="subtitle">管理您的财务，从这里开始</p>
    </div>

    <!-- 登录表单 -->
    <div class="form-container">
      <van-tabs v-model:active="activeTab" class="auth-tabs">
        <!-- 登录标签页 -->
        <van-tab title="登录" name="login">
          <van-form @submit="handleLogin" class="auth-form">
            <van-field
              v-model="loginForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请输入用户名' }]"
              left-icon="contact"
            />
            <van-field
              v-model="loginForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请输入密码' }]"
              left-icon="lock"
            />
            <div class="form-actions">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="authStore.loading"
                class="submit-btn"
              >
                登录
              </van-button>
            </div>
          </van-form>
        </van-tab>

        <!-- 注册标签页 -->
        <van-tab title="注册" name="register">
          <van-form @submit="handleRegister" class="auth-form">
            <van-field
              v-model="registerForm.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' }
              ]"
              left-icon="contact"
            />
            <van-field
              v-model="registerForm.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱（可选）"
              type="email"
              left-icon="envelop-o"
            />
            <van-field
              v-model="registerForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]"
              left-icon="lock"
            />
            <van-field
              v-model="registerForm.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
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
                :loading="authStore.loading"
                class="submit-btn"
              >
                注册
              </van-button>
            </div>
          </van-form>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <p class="tip">首次使用？注册后将自动创建示例数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useRecordStore } from '../stores/recordStore'
import { LoginFormData, RegisterFormData } from '../types'
import { 
  showToast,
  Tabs as VanTabs,
  Tab as VanTab,
  Form as VanForm,
  Field as VanField,
  Button as VanButton
} from 'vant'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前活跃的标签页
const activeTab = ref('login')

// 登录表单数据
const loginForm = reactive<LoginFormData>({
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 确认密码验证
const validateConfirmPassword = (value: string) => {
  if (value !== registerForm.password) {
    return '两次输入的密码不一致'
  }
  return true
}

// 处理登录
const handleLogin = async () => {
  try {
    const success = await authStore.login(loginForm)
    if (success) {
      // 登录成功，加载用户数据
      const recordStore = useRecordStore()
      await Promise.all([
        recordStore.loadCategories(),
        recordStore.loadAccounts(),
        recordStore.loadRecords()
      ])
      
      // 重定向到原来访问的页面或首页
      const redirect = route.query.redirect as string
      router.replace(redirect || '/')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请重试')
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    const success = await authStore.register(registerForm)
    if (success) {
      // 注册成功，切换到登录标签页
      activeTab.value = 'login'
      // 清空注册表单
      Object.assign(registerForm, {
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      })
      // 自动填入用户名到登录表单
      loginForm.username = registerForm.username
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast('注册失败，请重试')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.header {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.form-container {
  flex: 1;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.auth-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-form {
  padding: 20px;
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
  text-align: center;
  margin-top: 40px;
}

.tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
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

/* 标签页样式调整 */
:deep(.van-tabs__nav) {
  background: #f8f9fa;
}

:deep(.van-tab) {
  font-weight: 500;
}

:deep(.van-tab--active) {
  color: #1989fa;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .header {
    margin-top: 40px;
    margin-bottom: 30px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .auth-form {
    padding: 16px;
  }
}
</style>