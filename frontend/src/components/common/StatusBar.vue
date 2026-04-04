<template>
  <div class="status-bar-section">
    <el-divider />
    
    <!-- 压缩进度 -->
    <div class="status-item" v-if="progress.status === 'compressing'">
      <div class="status-label">
        <el-icon><Loading class="is-loading" /></el-icon>
        压缩进度：
      </div>
      <div class="status-content">
        <el-progress
          :percentage="progress.percentage"
          :status="progress.status as string === 'error' ? 'exception' : undefined"
          :format="formatProgress"
        />
      </div>
    </div>

    <!-- 处理信息 -->
    <div class="status-item" v-if="progress.currentFile">
      <div class="status-label">
        <el-icon><InfoFilled /></el-icon>
        当前处理：
      </div>
      <div class="status-content">
        <span>{{ progress.currentFile }}</span>
        <span v-if="currentFileInfo" class="file-info">{{ currentFileInfo }}</span>
      </div>
    </div>

    <!-- 完成信息 -->
    <div class="status-item" v-else-if="progress.status === 'completed'">
      <div class="status-label">
        <el-icon><CircleCheck /></el-icon>
        处理完成：
      </div>
      <div class="status-content">
        <span>{{ completedMessage }}</span>
      </div>
    </div>

    <!-- 错误信息 -->
    <div class="status-item error" v-else-if="progress.status === 'error'">
      <div class="status-label">
        <el-icon><CircleClose /></el-icon>
        处理失败：
      </div>
      <div class="status-content">
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- 空闲状态 -->
    <div class="status-item" v-else>
      <div class="status-label">
        <el-icon><Info /></el-icon>
        就绪：
      </div>
      <div class="status-content">
        <span>等待处理图片</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading, InfoFilled, CircleCheck, CircleClose, InfoFilled as Info } from '@element-plus/icons-vue'
import type { CompressionProgress } from '../../types'

const props = defineProps<{
  progress: CompressionProgress
  errorMessage?: string
  currentFileInfo?: string
}>()

const formatProgress = (percentage: number) => {
  return `${percentage}% (${props.progress.current}/${props.progress.total})`
}

const completedMessage = computed(() => {
  if (props.progress.total === 1) {
    return '压缩完成，图片已处理'
  }
  return `压缩完成，共处理 ${props.progress.total} 张图片`
})
</script>

<style scoped>
.status-bar-section {
  margin-top: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.status-item.error {
  background-color: #fef0f0;
  border-left: 4px solid #f56c6c;
}

.status-label {
  width: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.status-content {
  flex: 1;
  font-size: 14px;
  color: #303133;
  line-height: 20px;
}

.file-info {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
