<template>
  <div class="category-manage">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-content">
        <div class="nav-left" @click="router.back()">
          <van-icon name="arrow-left" size="20" />
          <span>返回</span>
        </div>
        <div class="nav-title">分类管理</div>
        <div class="nav-right" @click="showAddDialog = true">
          <van-icon name="plus" size="20" />
          <span>添加</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 类型切换标签 -->
      <div class="tab-container">
        <div class="tab-buttons">
          <div 
            class="tab-button" 
            :class="{ active: activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            <van-icon name="minus" size="16" />
            <span>支出</span>
          </div>
          <div 
            class="tab-button" 
            :class="{ active: activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            <van-icon name="plus" size="16" />
            <span>收入</span>
          </div>
        </div>
      </div>

      <!-- 分类列表 -->
      <div class="category-content">
        <div v-if="activeTab === 'expense'" class="category-list">
          <div v-if="expenseCategories.length === 0" class="empty-state">
            <van-icon name="records" size="48" color="#ccc" />
            <p>暂无支出分类</p>
            <van-button type="primary" size="small" @click="showAddDialog = true">
              添加第一个分类
            </van-button>
          </div>
          <div v-else class="category-items">
            <div 
              v-for="category in expenseCategories" 
              :key="category.id" 
              class="category-item"
            >
              <div class="category-info">
                <div 
                  class="category-icon" 
                  :style="{ backgroundColor: category.color }"
                >
                  <van-icon :name="category.icon" size="20" color="white" />
                </div>
                <div class="category-details">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-meta">支出分类</div>
                </div>
              </div>
              <div class="category-actions">
                <van-button 
                  type="default" 
                  size="mini" 
                  @click="editCategory(category)"
                >
                  编辑
                </van-button>
                <van-button 
                  type="danger" 
                  size="mini" 
                  @click="deleteCategory(category.id)"
                >
                  删除
                </van-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'income'" class="category-list">
          <div v-if="incomeCategories.length === 0" class="empty-state">
            <van-icon name="records" size="48" color="#ccc" />
            <p>暂无收入分类</p>
            <van-button type="primary" size="small" @click="showAddDialog = true">
              添加第一个分类
            </van-button>
          </div>
          <div v-else class="category-items">
            <div 
              v-for="category in incomeCategories" 
              :key="category.id" 
              class="category-item"
            >
              <div class="category-info">
                <div 
                  class="category-icon" 
                  :style="{ backgroundColor: category.color }"
                >
                  <van-icon :name="category.icon" size="20" color="white" />
                </div>
                <div class="category-details">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-meta">收入分类</div>
                </div>
              </div>
              <div class="category-actions">
                <van-button 
                  type="default" 
                  size="mini" 
                  @click="editCategory(category)"
                >
                  编辑
                </van-button>
                <van-button 
                  type="danger" 
                  size="mini" 
                  @click="deleteCategory(category.id)"
                >
                  删除
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类弹窗 -->
    <van-dialog
      v-model:show="showAddDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      show-cancel-button
      @confirm="saveCategory"
      @cancel="resetForm"
    >
      <div class="category-form">
        <!-- 分类名称 -->
        <van-field
          v-model="formData.name"
          label="名称"
          placeholder="请输入分类名称"
          :rules="[{ required: true, message: '请输入分类名称' }]"
        />

        <!-- 图标选择 -->
        <van-field
          v-model="formData.iconText"
          label="图标"
          placeholder="选择图标"
          readonly
          is-link
          @click="showIconPicker = true"
        />

        <!-- 颜色选择 -->
        <van-field
          v-model="formData.color"
          label="颜色"
          placeholder="选择颜色"
          readonly
          is-link
          @click="showColorPicker = true"
        >
          <template #right-icon>
            <div
              class="color-preview"
              :style="{ backgroundColor: formData.color }"
            ></div>
          </template>
        </van-field>
      </div>
    </van-dialog>

    <!-- 图标选择器 -->
    <van-popup v-model:show="showIconPicker" position="bottom">
      <div class="icon-picker">
        <div class="picker-header">
          <h3>选择图标</h3>
          <van-button type="primary" size="small" @click="showIconPicker = false">
            确定
          </van-button>
        </div>
        <div class="icon-grid">
          <div
            v-for="icon in iconOptions"
            :key="icon.value"
            class="icon-item"
            :class="{ active: formData.icon === icon.value }"
            @click="selectIcon(icon)"
          >
            <van-icon :name="icon.value" size="24" />
            <span class="icon-name">{{ icon.text }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 颜色选择器 -->
    <van-popup v-model:show="showColorPicker" position="bottom">
      <div class="color-picker">
        <div class="picker-header">
          <h3>选择颜色</h3>
          <van-button type="primary" size="small" @click="showColorPicker = false">
            确定
          </van-button>
        </div>
        <div class="color-grid">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-item"
            :class="{ active: formData.color === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          >
            <van-icon v-if="formData.color === color" name="success" color="white" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      message="删除分类后，相关记录的分类将被清空，确定要删除吗？"
      show-cancel-button
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  showToast,
  Dialog as VanDialog,
  Popup as VanPopup,
  Icon as VanIcon,
  Button as VanButton,
  Field as VanField,
  Cell as VanCell,
  CellGroup as VanCellGroup
} from 'vant'
import { useRecordStore } from '../stores/recordStore'
import type { Category } from '../types'

const recordStore = useRecordStore()
const router = useRouter()

// 状态
const activeTab = ref<'income' | 'expense'>('expense')
const showAddDialog = ref(false)
const showIconPicker = ref(false)
const showColorPicker = ref(false)
const showDeleteConfirm = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategoryId = ref<string>('')

// 表单数据
const formData = reactive({
  name: '',
  icon: 'other-pay',
  iconText: '其他',
  color: '#1989fa'
})

// 计算属性
const expenseCategories = computed(() => 
  recordStore.categories.filter(c => c.type === 'expense')
)

const incomeCategories = computed(() => 
  recordStore.categories.filter(c => c.type === 'income')
)

// 图标选项
const iconOptions = [
  { text: '餐饮', value: 'food-o' },
  { text: '交通', value: 'logistics' },
  { text: '购物', value: 'shopping-cart-o' },
  { text: '娱乐', value: 'music-o' },
  { text: '医疗', value: 'cross' },
  { text: '教育', value: 'certificate' },
  { text: '住房', value: 'home-o' },
  { text: '工资', value: 'gold-coin-o' },
  { text: '奖金', value: 'gift-o' },
  { text: '投资', value: 'chart-trending-o' },
  { text: '兼职', value: 'bag-o' },
  { text: '现金', value: 'cash' },
  { text: '银行卡', value: 'credit-pay' },
  { text: '支付宝', value: 'alipay' },
  { text: '微信', value: 'wechat-pay' },
  { text: '其他', value: 'ellipsis' },
  { text: '加号', value: 'plus' },
  { text: '减号', value: 'minus' },
  { text: '星星', value: 'star-o' },
  { text: '心形', value: 'like-o' }
]

// 颜色选项
const colorOptions = [
  '#1989fa', '#07c160', '#ff976a', '#ed4014', '#9c26b0',
  '#ff9800', '#795548', '#607d8b', '#e91e63', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff5722'
]

// 方法
const selectIcon = (icon: any) => {
  formData.icon = icon.value
  formData.iconText = icon.text
}

const selectColor = (color: string) => {
  formData.color = color
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  formData.name = category.name
  formData.icon = category.icon
  formData.iconText = iconOptions.find(icon => icon.value === category.icon)?.text || '其他'
  formData.color = category.color
  showAddDialog.value = true
}

const deleteCategory = (categoryId: string) => {
  deletingCategoryId.value = categoryId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await recordStore.deleteCategory(deletingCategoryId.value)
    showToast('删除成功')
  } catch (error) {
    showToast('删除失败')
  }
  showDeleteConfirm.value = false
}

const saveCategory = async () => {
  if (!formData.name.trim()) {
    showToast('请输入分类名称')
    return
  }

  try {
    const categoryData = {
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      type: activeTab.value
    }

    if (editingCategory.value) {
      await recordStore.updateCategory(editingCategory.value.id, categoryData)
      showToast('更新成功')
    } else {
      await recordStore.addCategory(categoryData)
      showToast('添加成功')
    }
    
    resetForm()
  } catch (error) {
    showToast('保存失败')
  }
}

const resetForm = () => {
  showAddDialog.value = false
  editingCategory.value = null
  formData.name = ''
  formData.icon = 'other-pay'
  formData.iconText = '其他'
  formData.color = '#1989fa'
}

// 组件挂载
onMounted(async () => {
  await recordStore.loadCategories()
})
</script>

<style scoped>
.category-manage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.nav-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 56px;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-left:hover,
.nav-right:hover {
  background: rgba(25, 137, 250, 0.2);
  transform: translateY(-1px);
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  margin: 16px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 标签切换 */
.tab-container {
  padding: 20px 20px 0;
}

.tab-buttons {
  display: flex;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.tab-button.active {
  background: white;
  color: #1989fa;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
}

/* 分类内容 */
.category-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.category-list {
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.empty-state p {
  margin: 16px 0;
  color: #999;
  font-size: 14px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-meta {
  font-size: 12px;
  color: #999;
}

.category-actions {
  display: flex;
  gap: 8px;
}

/* 表单样式 */
.category-form {
  padding: 16px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ddd;
}

/* 选择器样式 */
.icon-picker,
.color-picker {
  background: white;
  max-height: 60vh;
  overflow-y: auto;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.picker-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.icon-item:hover {
  background-color: #f5f7fa;
}

.icon-item.active {
  background-color: #1989fa;
  color: white;
  border-color: #1989fa;
}

.icon-name {
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
  font-weight: 500;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 16px;
}

.color-item {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.color-item:hover {
  transform: scale(1.05);
}

.color-item.active {
  transform: scale(1.1);
  border-color: white;
  box-shadow: 0 0 0 2px #1989fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-content {
    padding: 8px 12px;
  }
  
  .nav-left,
  .nav-right {
    min-width: 40px;
    min-height: 40px;
    justify-content: center;
  }
  
  .nav-left span,
  .nav-right span {
    display: none;
  }
  
  .main-content {
    margin: 8px;
    border-radius: 16px;
  }
  
  .icon-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .color-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .category-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 移除硬编码的深色主题样式，使用主题变量系统 */
</style>