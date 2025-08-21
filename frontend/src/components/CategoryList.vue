<template>
  <div class="category-list">
    <van-empty v-if="categories.length === 0" description="暂无分类" />
    <div v-else class="category-items">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
      >
        <div class="category-info">
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            <van-icon :name="category.icon" color="white" size="20" />
          </div>
          <div class="category-details">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-meta">
              创建时间: {{ formatDate(category.createdAt) }}
            </div>
          </div>
        </div>
        <div class="category-actions">
          <van-button
            type="primary"
            size="small"
            @click="handleEdit(category)"
          >
            编辑
          </van-button>
          <van-button
            type="danger"
            size="small"
            @click="handleDelete(category)"
          >
            删除
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Category } from '../types'
import { formatDate } from '../utils'

// Props
defineProps<{
  categories: Category[]
}>()

// Emits
const emit = defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()

// 事件处理
const handleEdit = (category: Category) => {
  emit('edit', category)
}

const handleDelete = (category: Category) => {
  emit('delete', category)
}
</script>

<style scoped>
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

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .category-item {
    background: #2a2a2a;
    color: #fff;
  }

  .category-name {
    color: #fff;
  }

  .category-meta {
    color: #999;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
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