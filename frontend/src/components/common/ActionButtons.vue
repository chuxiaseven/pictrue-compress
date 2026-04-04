<template>
  <div class="action-buttons-section">
    <el-button
      type="primary"
      size="large"
      :disabled="!canCompress"
      :loading="isCompressing"
      @click="handleCompress"
    >
      <el-icon><Rank /></el-icon>
      压缩所选图片 ({{ selectedCount }})
    </el-button>
    
    <el-button
      type="success"
      size="large"
      :disabled="!canBatchCompress"
      :loading="isCompressing"
      @click="handleBatchCompress"
    >
      <el-icon><FolderCheckedIcon /></el-icon>
      批量压缩全部 ({{ totalCount }})
    </el-button>
    
    <el-button
      v-if="hasResults"
      type="warning"
      size="large"
      @click="handleDownload"
    >
      <el-icon><Download /></el-icon>
      下载结果
    </el-button>
    
    <el-button
      v-if="hasResults"
      size="large"
      @click="handleClear"
    >
      <el-icon><RefreshRight /></el-icon>
      清空结果
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Rank, FolderChecked as FolderCheckedIcon, Download, RefreshRight } from '@element-plus/icons-vue'

defineProps<{
  selectedCount: number
  totalCount: number
  isCompressing: boolean
  hasResults: boolean
  canCompress: boolean
  canBatchCompress: boolean
}>()

const emit = defineEmits<{
  compress: []
  batchCompress: []
  download: []
  clear: []
}>()

const handleCompress = () => {
  emit('compress')
}

const handleBatchCompress = () => {
  emit('batchCompress')
}

const handleDownload = () => {
  emit('download')
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.action-buttons-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
