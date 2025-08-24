import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/ForgotPassword.vue'),
    meta: {
      title: '忘记密码',
      requiresAuth: false
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/ResetPassword.vue'),
    meta: {
      title: '重置密码',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../components/Layout.vue'),
    redirect: '/home',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../pages/Home.vue'),
        meta: {
          title: '首页',
          keepAlive: true,
          requiresAuth: true
        }
      },
      {
        path: '/add-record',
        name: 'AddRecord',
        component: () => import('../pages/AddRecord.vue'),
        meta: {
          title: '记账',
          requiresAuth: true
        }
      },
      {
        path: '/statistics',
        name: 'Statistics',
        component: () => import('../pages/Statistics.vue'),
        meta: {
          title: '统计',
          keepAlive: true,
          requiresAuth: true
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../pages/Settings.vue'),
        meta: {
          title: '设置',
          requiresAuth: true
        }
      },
      {
        path: '/cloud-test',
        name: 'CloudTest',
        component: () => import('../pages/CloudTest.vue'),
        meta: {
          title: '云数据库测试',
          requiresAuth: false
        }
      },
      {
        path: '/category-manage',
        name: 'CategoryManage',
        component: () => import('../views/CategoryManage.vue'),
        meta: {
          title: '分类管理',
          requiresAuth: true
        }
      },
      {
        path: '/account-manage',
        name: 'AccountManage',
        component: () => import('../views/AccountManage.vue'),
        meta: {
          title: '账户管理',
          requiresAuth: true
        }
      },
      {
        path: '/help',
        name: 'Help',
        component: () => import('../pages/Help.vue'),
        meta: {
          title: '使用帮助',
          requiresAuth: true
        }
      },
      {
        path: '/feedback',
        name: 'Feedback',
        component: () => import('../pages/Feedback.vue'),
        meta: {
          title: '意见反馈',
          requiresAuth: true
        }
      },
      {
        path: '/feedback/:id',
        name: 'FeedbackDetail',
        component: () => import('../pages/FeedbackDetail.vue'),
        meta: {
          title: '反馈详情',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/record/:id',
    name: 'RecordDetail',
    component: () => import('../pages/RecordDetail.vue'),
    meta: {
      title: '记录详情',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Trae记账本`
  } else {
    document.title = 'Trae记账本'
  }
  
  // 检查认证状态
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，重定向到登录页
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router