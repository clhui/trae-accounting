import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User, AuthState, LoginFormData, RegisterFormData } from '../types'
import { BackendApiService } from '../services/backendApi'
import { showToast } from 'vant'

// 简单的密码哈希函数（生产环境应使用更安全的方法）
function hashPassword(password: string): string {
  // 这里使用简单的哈希，实际项目中应使用bcrypt等安全库
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return hash.toString()
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  // 计算属性
  const authState = computed<AuthState>(() => ({
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    token: token.value
  }))

  // 从本地存储恢复认证状态
  const restoreAuth = () => {
    try {
      const savedAuth = localStorage.getItem('auth')
      if (savedAuth) {
        const authData = JSON.parse(savedAuth)
        isAuthenticated.value = authData.isAuthenticated
        user.value = authData.user
        token.value = authData.token
      }
    } catch (error) {
      console.error('恢复认证状态失败:', error)
      clearAuth()
    }
  }

  // 保存认证状态到本地存储
  const saveAuth = () => {
    try {
      localStorage.setItem('auth', JSON.stringify(authState.value))
    } catch (error) {
      console.error('保存认证状态失败:', error)
    }
  }

  // 清除认证状态
  const clearAuth = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('auth')
  }

  // 用户注册
  const register = async (formData: RegisterFormData): Promise<boolean> => {
    try {
      loading.value = true

      // 验证表单
      if (!formData.username || !formData.password) {
        showToast('用户名和密码不能为空')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('两次输入的密码不一致')
        return false
      }

      if (formData.password.length < 6) {
        showToast('密码长度至少6位')
        return false
      }

      // 使用后端API注册用户
      const result = await BackendApiService.signUp(
        formData.email || `${formData.username}@example.com`,
        formData.password,
        formData.username
      )
      
      // 设置认证状态
      isAuthenticated.value = true
      user.value = result.user
      token.value = result.token

      // 保存到本地存储
      saveAuth()

      showToast('注册成功')
      return true
    } catch (error) {
      console.error('注册失败:', error)
      showToast(error instanceof Error ? error.message : '注册失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 用户登录
  const login = async (formData: LoginFormData): Promise<boolean> => {
    try {
      loading.value = true

      // 验证表单
      if (!formData.username || !formData.password) {
        showToast('用户名和密码不能为空')
        return false
      }

      // 使用后端API登录
      const result = await BackendApiService.signIn(
        formData.username,
        formData.password
      )

      // 设置认证状态
      isAuthenticated.value = true
      user.value = result.user
      token.value = result.token

      // 保存到本地存储
      saveAuth()

      showToast('登录成功')
      return true
    } catch (error) {
      console.error('登录失败:', error)
      showToast(error instanceof Error ? error.message : '登录失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const logout = async () => {
    try {
      // 调用后端API登出
      await BackendApiService.signOut()
    } catch (error) {
      console.warn('后端登出失败:', error)
    }
    
    // 清除本地认证状态
    clearAuth()
    showToast('已退出登录')
  }

  // 检查认证状态
  const checkAuth = (): boolean => {
    return isAuthenticated.value && !!user.value
  }

  // 获取当前用户ID
  const getCurrentUserId = (): string | null => {
    return user.value?.id || null
  }

  // 初始化时恢复认证状态
  restoreAuth()

  return {
    // 状态
    isAuthenticated,
    user,
    token,
    loading,
    authState,
    
    // 方法
    register,
    login,
    logout,
    checkAuth,
    getCurrentUserId,
    restoreAuth,
    clearAuth
  }
})