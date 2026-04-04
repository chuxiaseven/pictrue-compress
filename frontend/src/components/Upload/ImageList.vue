<template>
  <div class="image-list-section">
    <div class="list-header">
      <h3>已上传图片列表 ({{ files.length }})</h3>
      <div class="list-actions" v-if="files.length > 0">
        <el-button type="primary" size="small" @click="selectAll">
          全选
        </el-button>
        <el-button size="small" @click="deselectAll">
          取消全选
        </el-button>
        <el-button type="danger" size="small" @click="clearAll">
          <el-icon><Delete /></el-icon>
          清除全部
        </el-button>
      </div>
    </div>
    
    <div class="image-list" v-if="files.length > 0">
      <div
        v-for="file in files"
        :key="file.id"
        class="image-item"
        :class="{ selected: selectedIds.includes(file.id) }"
        @click="toggleSelect(file.id)"
      >
        <div class="image-preview">
          <img :src="file.preview" :alt="file.name" />
          <div class="image-overlay">
            <el-checkbox :model-value="selectedIds.includes(file.id)" @click.stop />
          </div>
          <div class="image-status" v-if="file.status !== 'pending'">
            <el-icon v-if="file.status === 'uploading'"><Loading class="is-loading" /></el-icon>
            <el-icon v-else-if="file.status === 'success'" class="success"><CircleCheckIcon /></el-icon>
            <el-icon v-else-if="file.status === 'error'" class="error"><CircleCloseIcon /></el-icon>
          </div>
        </div>
        <div class="image-info">
          <span class="image-name" :title="file.name">{{ file.name }}</span>
          <span class="image-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <el-button
          class="delete-btn"
          type="danger"
          circle
          size="small"
          @click.stop="removeFile(file.id)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
        <el-progress
          v-if="file.status === 'uploading'"
          :percentage="file.progress"
          :show-text="false"
          :stroke-width="3"
          class="upload-progress"
        />
      </div>
    </div>
    
    <div v-else class="empty-list">
      <el-empty description="暂无上传图片" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Loading, CircleCheck as CircleCheckIcon, CircleClose as CircleCloseIcon } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { UploadFile } from '../../types'

const props = defineProps<{
  files: UploadFile[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  remove: [id: string]
  clear: []
}>()

const selectedIds = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const selectAll = () => {
  selectedIds.value = props.files.map(f => f.id)
}

const deselectAll = () => {
  selectedIds.value = []
}

const removeFile = (id: string) => {
  emit('remove', id)
}

const clearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有图片吗？此操作不可恢复。',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('clear')
    selectedIds.value = []
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.image-list-section {
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.image-item {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: #409eff;
}

.image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.image-status {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.image-status .success {
  color: #67c23a;
  font-size: 20px;
}

.image-status .error {
  color: #f56c6c;
  font-size: 20px;
}

.image-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-name {
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  font-size: 11px;
  color: #909399;
}

.delete-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .delete-btn {
  opacity: 1;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.empty-list {
  padding: 40px;
  background-color: #f5f7fa;
  border-radius: 8px;
}
</style>
