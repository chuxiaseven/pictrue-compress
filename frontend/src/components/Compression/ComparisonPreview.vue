<template>
  <div class="comparison-preview">
    <div class="preview-header">
      <h3 class="preview-title">压缩前后对比</h3>
      <div class="comparison-mode">
        <button 
          :class="{ active: mode === 'side-by-side' }"
          @click="mode = 'side-by-side'"
        >
          并排对比
        </button>
        <button 
          :class="{ active: mode === 'slider' }"
          @click="mode = 'slider'"
        >
          滑块对比
        </button>
        <button 
          :class="{ active: mode === 'switch' }"
          @click="mode = 'switch'"
        >
          切换对比
        </button>
      </div>
    </div>
    
    <!-- 并排对比 -->
    <div v-if="mode === 'side-by-side'" class="comparison-container">
      <!-- 原始图片 -->
      <div class="image-section">
        <div class="image-header">
          <h4>原始图片</h4>
          <span class="image-info">{{ formatSize(originalSize) }}</span>
        </div>
        <div 
          class="image-wrapper" 
          @wheel="handleZoom"
          @mousedown="startDrag"
          @mousemove="handleDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <img 
            :src="originalUrl || fallbackOriginalUrl.value" 
            alt="原始图片" 
            class="preview-image"
            :style="{
              transform: `scale(${zoomLevel}) translate(${dragX}px, ${dragY}px)`,
              transformOrigin: 'center center'
            }"
            @error="handleImageError('original')"
          />
        </div>
        <div class="image-footer">
          <span>{{ originalWidth }} × {{ originalHeight }}</span>
        </div>
      </div>
      
      <!-- 压缩后图片 -->
      <div class="image-section">
        <div class="image-header">
          <h4>压缩后图片</h4>
          <span class="image-info">{{ formatSize(compressedSize) }} ({{ Math.round(compressionRatio * 100) }}%)</span>
        </div>
        <div 
          class="image-wrapper" 
          @wheel="handleZoom"
          @mousedown="startDrag"
          @mousemove="handleDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <img 
            :src="compressedUrl || fallbackCompressedUrl.value" 
            alt="压缩后图片" 
            class="preview-image"
            :style="{
              transform: `scale(${zoomLevel}) translate(${dragX}px, ${dragY}px)`,
              transformOrigin: 'center center'
            }"
            @error="handleImageError('compressed')"
          />
        </div>
        <div class="image-footer">
          <span>{{ compressedWidth }} × {{ compressedHeight }}</span>
        </div>
      </div>
    </div>
    
    <!-- 滑块对比 -->
    <div v-else-if="mode === 'slider'" class="slider-comparison">
      <div class="slider-container">
        <div class="slider-wrapper" @mousemove="handleSliderMove" @touchmove="handleSliderMove">
          <div class="slider-content" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
            <img :src="originalUrl || fallbackOriginalUrl.value" alt="原始图片" class="slider-image" @error="handleImageError('original')" />
          </div>
          <img :src="compressedUrl || fallbackCompressedUrl.value" alt="压缩后图片" class="slider-image" @error="handleImageError('compressed')" />
          <div class="slider-handle" :style="{ left: `${sliderPosition}%` }">
            <div class="slider-line"></div>
            <div class="slider-dot"></div>
          </div>
        </div>
      </div>
      <div class="slider-labels">
        <span>原始图片</span>
        <span>压缩后图片</span>
      </div>
    </div>
    
    <!-- 切换对比 -->
    <div v-else-if="mode === 'switch'" class="switch-comparison">
      <div class="switch-container">
        <div class="image-wrapper">
          <img 
            :src="currentImage === 'original' ? (originalUrl || fallbackOriginalUrl.value) : (compressedUrl || fallbackCompressedUrl.value)" 
            alt="预览图片" 
            class="preview-image"
            @click="toggleImage"
            @error="handleImageError(currentImage as 'original' | 'compressed')"
          />
          <div class="switch-overlay" @click="toggleImage">
            <div class="switch-text">{{ currentImage === 'original' ? '点击查看压缩后' : '点击查看原始' }}</div>
          </div>
        </div>
        <div class="image-info">
          <span>{{ currentImage === 'original' ? '原始图片' : '压缩后图片' }}</span>
          <span>{{ currentImage === 'original' ? formatSize(originalSize) : formatSize(compressedSize) }}</span>
          <span>{{ currentImage === 'original' ? `${originalWidth} × ${originalHeight}` : `${compressedWidth} × ${compressedHeight}` }}</span>
        </div>
      </div>
    </div>
    
    <!-- 预览控制 -->
    <div class="preview-controls">
      <button @click="resetZoom" class="control-btn">
        100%
      </button>
      <button @click="zoomIn" class="control-btn">
        放大
      </button>
      <button @click="zoomOut" class="control-btn">
        缩小
      </button>
    </div>
    
    <!-- 压缩信息 -->
    <div class="compression-info">
      <div class="info-item">
        <span class="info-label">压缩比例:</span>
        <span class="info-value">{{ Math.round(compressionRatio * 100) }}%</span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ originalSize > compressedSize ? '节省空间:' : '增加空间:' }}</span>
        <span class="info-value">{{ formatSize(Math.abs(originalSize - compressedSize)) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">文件格式:</span>
        <span class="info-value">{{ getFileExtension(originalName) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">分辨率:</span>
        <span class="info-value">{{ originalWidth }}×{{ originalHeight }} → {{ compressedWidth }}×{{ compressedHeight }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  originalUrl: {
    type: String,
    required: true
  },
  compressedUrl: {
    type: String,
    required: true
  },
  originalSize: {
    type: Number,
    default: 0
  },
  compressedSize: {
    type: Number,
    default: 0
  },
  compressionRatio: {
    type: Number,
    default: 0
  },
  originalName: {
    type: String,
    required: true
  }
})

// 对比模式
const mode = ref('side-by-side')

// 切换对比状态
const currentImage = ref('original')
const currentImageUrl = computed(() => {
  return currentImage.value === 'original' 
    ? (props.originalUrl || fallbackOriginalUrl.value) 
    : (props.compressedUrl || fallbackCompressedUrl.value)
})

// 滑块对比状态
const sliderPosition = ref(50)

// 预览控制状态
const zoomLevel = ref(1)
const dragX = ref(0)
const dragY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

// 图片分辨率
const originalWidth = ref(0)
const originalHeight = ref(0)
const compressedWidth = ref(0)
const compressedHeight = ref(0)

// 备用图片URL（当加载失败时使用）
const fallbackOriginalUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjQjBCMEIwIj7kuLvluqfliLDliqHpg73kuIDkuK3nqLygkNeQkQo8L3RleHQ+Cjwvc3ZnPg==')
const fallbackCompressedUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjQjBCMEIwIj7kuLvluqfliLDliqHpg73kuIDkuK3nqLygkNeQkQo8L3RleHQ+Cjwvc3ZnPg==')

// 处理图片加载失败
const handleImageError = (type: 'original' | 'compressed') => {
  if (type === 'original') {
    fallbackOriginalUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjQjBCMEIwIj7kuLvluqfliLDliqHpg73kuIDkuK3nqLygkNeQkQo8L3RleHQ+Cjwvc3ZnPg=='
  } else {
    fallbackCompressedUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjQjBCMEIwIj7kuLvluqfliLDliqHpg73kuIDkuK3nqLygkNeQkQo8L3RleHQ+Cjwvc3ZnPg=='
  }
}

// 格式化文件大小
const formatSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件扩展名
const getFileExtension = (fileName: string): string => {
  if (!fileName) return '未知'
  return fileName.split('.').pop()?.toUpperCase() || '未知'
}

// 切换图片
const toggleImage = () => {
  currentImage.value = currentImage.value === 'original' ? 'compressed' : 'original'
}

// 处理滑块移动
const handleSliderMove = (event: MouseEvent | TouchEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const position = ((clientX - rect.left) / rect.width) * 100
  sliderPosition.value = Math.max(0, Math.min(100, position))
}

// 处理缩放
const handleZoom = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.max(0.1, Math.min(5, zoomLevel.value * delta))
}

// 放大
const zoomIn = () => {
  zoomLevel.value = Math.min(5, zoomLevel.value * 1.2)
}

// 缩小
const zoomOut = () => {
  zoomLevel.value = Math.max(0.1, zoomLevel.value / 1.2)
}

// 重置缩放
const resetZoom = () => {
  zoomLevel.value = 1
  dragX.value = 0
  dragY.value = 0
}

// 开始拖拽
const startDrag = (event: MouseEvent) => {
  isDragging.value = true
  startX.value = event.clientX - dragX.value
  startY.value = event.clientY - dragY.value
}

// 处理拖拽
const handleDrag = (event: MouseEvent) => {
  if (isDragging.value) {
    dragX.value = event.clientX - startX.value
    dragY.value = event.clientY - startY.value
  }
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
}

// 加载图片分辨率
onMounted(() => {
  const originalImg = new Image()
  originalImg.onload = () => {
    originalWidth.value = originalImg.width
    originalHeight.value = originalImg.height
  }
  originalImg.src = props.originalUrl

  const compressedImg = new Image()
  compressedImg.onload = () => {
    compressedWidth.value = compressedImg.width
    compressedHeight.value = compressedImg.height
  }
  compressedImg.src = props.compressedUrl
})
</script>

<style scoped>
.comparison-preview {
  margin-top: 24px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.comparison-mode {
  display: flex;
  gap: 8px;
}

.comparison-mode button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comparison-mode button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.comparison-mode button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.comparison-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.image-section {
  flex: 1;
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.image-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.image-info {
  font-size: 12px;
  color: #999;
}

.image-wrapper {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: grab;
}

.image-wrapper:active {
  cursor: grabbing;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.1s ease;
}

.image-footer {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* 滑块对比样式 */
.slider-comparison {
  margin-bottom: 20px;
}

.slider-container {
  width: 100%;
  height: 300px;
  position: relative;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.slider-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: ew-resize;
}

.slider-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.slider-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.slider-handle {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: #1890ff;
  z-index: 2;
  transform: translateX(-50%);
}

.slider-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #1890ff;
  cursor: ew-resize;
}

.slider-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background-color: #1890ff;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

/* 切换对比样式 */
.switch-comparison {
  margin-bottom: 20px;
}

.switch-container {
  position: relative;
}

.switch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.switch-overlay:hover {
  opacity: 0.8;
}

.switch-text {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 4px;
}

/* 预览控制样式 */
.preview-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

/* 压缩信息样式 */
.compression-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comparison-container {
    flex-direction: column;
  }
  
  .image-wrapper {
    height: 200px;
  }
  
  .slider-container {
    height: 200px;
  }
  
  .compression-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .comparison-mode {
    width: 100%;
    justify-content: space-between;
  }
}
</style>