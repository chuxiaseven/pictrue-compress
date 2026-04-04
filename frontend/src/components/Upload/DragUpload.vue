<template>
  <div
    class="drag-upload-area"
    :class="{ 'is-dragover': isDragOver }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @click="handleClick"
  >
    <div class="upload-content">
      <div class="upload-icon">
        <el-icon :size="48"><UploadFilledIcon /></el-icon>
      </div>
      <p class="upload-text">拖拽图片到这里或点击上传</p>
      <p class="upload-hint">支持 JPG、PNG、WebP、GIF 等格式，单个文件最大 50MB</p>
      <div class="upload-buttons">
        <el-button type="primary" size="large" @click.stop="handleClick">
          <el-icon><Plus /></el-icon>
          选择文件
        </el-button>
        <el-button size="large" @click.stop="handleBatchUpload">
          <el-icon><FolderOpenedIcon /></el-icon>
          批量上传
        </el-button>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled as UploadFilledIcon, Plus, FolderOpened as FolderOpenedIcon } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

// 支持的图片格式
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
const maxFileSize = 50 * 1024 * 1024 // 50MB

const validateFile = (file: File): boolean => {
  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning(`${file.name} 不是支持的图片格式`)
    return false
  }
  if (file.size > maxFileSize) {
    ElMessage.warning(`${file.name} 超过 50MB 限制`)
    return false
  }
  return true
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  const validFiles = files.filter(validateFile)
  
  if (validFiles.length > 0) {
    emit('filesSelected', validFiles)
  }
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleClick = () => {
  fileInput.value?.click()
}

const handleBatchUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  const validFiles = files.filter(validateFile)
  
  if (validFiles.length > 0) {
    emit('filesSelected', validFiles)
  }
  
  // 清空 input 以便可以重复选择相同文件
  target.value = ''
}
</script>

<style scoped>
.drag-upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.drag-upload-area:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.drag-upload-area.is-dragover {
  border-color: #409eff;
  background-color: #ecf5ff;
  border-style: solid;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #909399;
  margin-bottom: 8px;
}

.upload-text {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.upload-hint {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
</style>
