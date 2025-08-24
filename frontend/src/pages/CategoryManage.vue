<template>
  <div class="category-manage">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="分类管理"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-button
          type="primary"
          size="small"
          @click="showAddDialog = true"
        >
          添加
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 类型切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="支出" name="expense">
        <CategoryList
          :categories="expenseCategories"
          @edit="editCategory"
          @delete="deleteCategory"
        />
      </van-tab>
      <van-tab title="收入" name="income">
        <CategoryList
          :categories="incomeCategories"
          @edit="editCategory"
          @delete="deleteCategory"
        />
      </van-tab>
    </van-tabs>

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
        <div class="icon-picker-header">
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
            <span class="emoji-icon">{{ icon.value }}</span>
            <span class="icon-name">{{ icon.text }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 颜色选择器 -->
    <van-popup v-model:show="showColorPicker" position="bottom">
      <div class="color-picker">
        <div class="color-picker-header">
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
import { showToast } from 'vant'
import { useRecordStore } from '../stores/recordStore'
import CategoryList from '../components/CategoryList.vue'
import type { Category } from '../types'

const recordStore = useRecordStore()

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
  { text: '餐饮', value: '🍽️' },
  { text: '交通', value: '🚗' },
  { text: '购物', value: '🛍️' },
  { text: '娱乐', value: '🎮' },
  { text: '医疗', value: '🏥' },
  { text: '教育', value: '📚' },
  { text: '住房', value: '🏠' },
  { text: '工资', value: '💰' },
  { text: '奖金', value: '🎁' },
  { text: '投资', value: '📈' },
  { text: '兼职', value: '💼' },
  { text: '现金', value: '💵' },
  { text: '银行卡', value: '💳' },
  { text: '支付宝', value: '📱' },
  { text: '微信', value: '💬' },
  { text: '其他', value: '📦' },
  { text: '食物', value: '🍕' },
  { text: '咖啡', value: '☕' },
  { text: '运动', value: '⚽' },
  { text: '旅行', value: '✈️' },
  { text: '礼物', value: '🎀' },
  { text: '书籍', value: '📖' },
  { text: '音乐', value: '🎵' },
  { text: '电影', value: '🎬' }
]

// 颜色选项
const colorOptions = [
  '#1989fa', '#07c160', '#ff976a', '#ed4014', '#19be6b',
  '#f90', '#515a6e', '#17233d', '#2d8cf0', '#19be6b',
  '#ff9900', '#ed4014', '#00d0b6', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
]

// 标签切换
const onTabChange = () => {
  resetForm()
}

// 编辑分类
const editCategory = (category: Category) => {
  editingCategory.value = category
  formData.name = category.name
  formData.icon = category.icon
  formData.iconText = iconOptions.find(icon => icon.value === category.icon)?.text || '其他'
  formData.color = category.color
  showAddDialog.value = true
}

// 删除分类
const deleteCategory = (category: Category) => {
  deletingCategoryId.value = category.id
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    await recordStore.deleteCategory(deletingCategoryId.value)
    showToast('删除成功')
  } catch (error) {
    console.error('删除分类失败:', error)
    showToast('删除失败')
  }
}

// 保存分类
const saveCategory = async () => {
  if (!formData.name.trim()) {
    showToast('请输入分类名称')
    return
  }

  try {
    const categoryData = {
      name: formData.name.trim(),
      type: activeTab.value,
      icon: formData.icon,
      color: formData.color
    }

    if (editingCategory.value) {
      // 编辑模式
      await recordStore.updateCategory(editingCategory.value.id, categoryData)
      showToast('更新成功')
    } else {
      // 添加模式
      await recordStore.addCategory(categoryData)
      showToast('添加成功')
    }

    resetForm()
    showAddDialog.value = false
  } catch (error) {
    console.error('保存分类失败:', error)
    showToast('保存失败')
  }
}

// 选择图标
const selectIcon = (icon: { text: string; value: string }) => {
  formData.icon = icon.value
  formData.iconText = icon.text
}

// 选择颜色
const selectColor = (color: string) => {
  formData.color = color
}

// 重置表单
const resetForm = () => {
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
  background-color: #f8f9fa;
}

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

.icon-picker,
.color-picker {
  background: white;
  max-height: 60vh;
  overflow-y: auto;
}

.icon-picker-header,
.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: #f5f5f5;
}

.icon-item.active {
  background-color: #1989fa;
  color: white;
}

.emoji-icon {
  font-size: 24px;
  line-height: 1;
  margin-bottom: 4px;
}

.icon-name {
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 16px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.3);
}

.category-list {
  padding: 16px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.category-meta {
  font-size: 12px;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 8px;
}

/* 移除硬编码的深色主题样式，使用主题变量系统 */

/* 响应式设计 */
@media (max-width: 768px) {
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
</style>