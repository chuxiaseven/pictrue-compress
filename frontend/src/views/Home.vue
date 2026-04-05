<template>
  <div class="home-container">
    <!-- 拖拽上传区域 -->
    <div class="upload-section">
      <DragUpload @files-selected="handleFilesSelected" />
    </div>

    <!-- 图片列表 -->
    <ImageList
      v-if="uploadStore.files.length > 0"
      :files="uploadStore.files"
      v-model="selectedIds"
      @remove="handleRemoveFile"
      @clear="handleClearFiles"
    />

    <!-- 操作按钮 -->
    <div class="action-buttons-container">
      <ActionButtons
        :selected-count="selectedIds.length"
        :total-count="uploadStore.files.length"
        :is-compressing="compressionStore.isCompressing"
        :has-results="compressionStore.results.length > 0"
        :can-compress="canCompress"
        :can-batch-compress="canBatchCompress"
        @compress="handleCompressSelected"
        @batch-compress="handleBatchCompress"
        @download="handleDownloadResults"
        @clear="handleClearResults"
      />
      <div class="settings-buttons">
        <el-button type="primary" size="large" @click="showCompressionSettings = true">压缩设置</el-button>
        <el-button type="primary" size="large" @click="showStorageSettings = true">存储设置</el-button>
      </div>
    </div>
    
    <!-- 压缩设置弹窗 -->
    <el-dialog
      v-model="showCompressionSettings"
      title="压缩设置"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
      :body-style="{ maxHeight: '500px', overflowY: 'auto' }"
    >
      <CompressionSettings 
        v-model="compressionSettings" 
        :selected-count="selectedIds.length" 
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCompressionSettings = false">取消</el-button>
          <el-button type="primary" @click="saveCompressionSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 存储设置弹窗 -->
    <el-dialog
      v-model="showStorageSettings"
      title="存储设置"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
      :body-style="{ maxHeight: '500px', overflowY: 'auto' }"
    >
      <Settings />
    </el-dialog>

    <!-- 压缩结果列表 -->
    <div v-if="compressionStore.results.length > 0" class="results-section">
      <h3 class="section-title">压缩结果</h3>
      <div class="results-list">
        <div
          v-for="result in compressionStore.results"
          :key="result.id"
          class="result-item"
          :class="{ 'active': selectedResult?.id === result.id }"
          @click="selectResult(result)"
        >
          <div class="result-info">
            <span class="result-name">{{ result.originalName }}</span>
            <span class="result-size">{{ formatSize(result.originalSize) }} → {{ formatSize(result.compressedSize) }}</span>
            <span class="result-ratio">节省 {{ Math.round((1 - result.compressionRatio) * 100) }}%</span>
          </div>
          <div class="result-actions">
            <button class="preview-btn" @click.stop="selectResult(result)">预览</button>
            <button class="download-btn" @click.stop="downloadSingleResult(result)">下载</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 对比预览 -->
    <ComparisonPreview
      v-if="selectedResult"
      :original-url="getOriginalImageUrl(selectedResult)"
      :compressed-url="`http://localhost:3000${selectedResult.previewUrl}`"
      :original-size="selectedResult.originalSize"
      :compressed-size="selectedResult.compressedSize"
      :compression-ratio="selectedResult.compressionRatio"
      :original-name="selectedResult.originalName ?? ''"
    />

    <!-- 状态栏 -->
    <StatusBar
      :progress="compressionStore.progress"
      :error-message="errorMessage"
      :current-file-info="currentFileInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 组件导入
import DragUpload from '../components/Upload/DragUpload.vue'
import ImageList from '../components/Upload/ImageList.vue'
import ActionButtons from '../components/common/ActionButtons.vue'
import StatusBar from '../components/common/StatusBar.vue'
import ComparisonPreview from '../components/Compression/ComparisonPreview.vue'
import CompressionSettings from '../components/Compression/CompressionSettings.vue'
import Settings from './Settings.vue'

// Store 导入
import { useUploadStore, useCompressionStore, useSettingsStore } from '../store'
import type { CompressionResult, CompressionSettings as CompressionSettingsType } from '../types'

// Store 实例
const uploadStore = useUploadStore()
const compressionStore = useCompressionStore()
const settingsStore = useSettingsStore()

// 响应式数据
const selectedIds = ref<string[]>([])
const errorMessage = ref('')
const currentFileInfo = ref('')
const selectedResult = ref<CompressionResult | null>(null)
const showCompressionSettings = ref(false)
const showStorageSettings = ref(false)
const compressionSettings = ref<CompressionSettingsType>({
  quality: 75,
  mode: 'medium',
  width: undefined,
  height: undefined,
  keepRatio: true,
  format: 'original',
  stripMetadata: true
})



// 计算属性
const canCompress = computed(() => {
  return uploadStore.files.length > 0 && selectedIds.value.length > 0
})

const canBatchCompress = computed(() => {
  return uploadStore.files.length > 0
})

// 生命周期
onMounted(() => {
  // 加载设置
  settingsStore.loadSettings()
})

// 处理文件选择
const handleFilesSelected = (files: File[]) => {
  uploadStore.addFiles(files)
  ElMessage.success(`成功添加 ${files.length} 张图片`)
}

// 处理移除文件
const handleRemoveFile = (id: string) => {
  uploadStore.removeFile(id)
  // 从选择中移除
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  }
  ElMessage.info('图片已移除')
}

// 处理清除所有文件
const handleClearFiles = () => {
  uploadStore.clearFiles()
  selectedIds.value = []
  ElMessage.success('所有图片已清除')
}

// 处理压缩所选图片
const handleCompressSelected = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要压缩的图片')
    return
  }

  try {
    errorMessage.value = ''
    const selectedFileIds = [...selectedIds.value]
    const uploadedFiles = []

    // 上传未上传的文件
    for (const id of selectedFileIds) {
      const file = uploadStore.files.find(f => f.id === id)
      if (file) {
        if (file.status === 'pending' || file.status === 'error') {
          await uploadStore.uploadFile(id)
        }
        // 上传后重新查找文件，获取更新后的ID
        const updatedFile = uploadStore.files.find(f => {
          // 尝试通过原始名称匹配，因为ID可能已更新
          return f.name === file.name
        })
        if (updatedFile && updatedFile.status === 'success') {
          uploadedFiles.push(updatedFile)
        }
      }
    }

    // 直接从上传成功的文件中获取ID
    const fileIds = uploadedFiles.map(f => f.id)

    console.log('Uploaded files:', uploadedFiles)
    console.log('File IDs for compression:', fileIds)

    if (fileIds.length === 0) {
      ElMessage.warning('上传失败，请重试')
      return
    }

    await compressionStore.batchCompress(fileIds)
    selectedIds.value = []
    ElMessage.success('压缩完成！')
  } catch (error) {
    console.error('Compression error:', error)
    errorMessage.value = '压缩失败，请重试'
    ElMessage.error('压缩失败')
  }
}

// 处理批量压缩
const handleBatchCompress = async () => {
  if (uploadStore.files.length === 0) {
    ElMessage.warning('请先上传图片')
    return
  }

  try {
    errorMessage.value = ''
    await uploadStore.uploadAll()
    const fileIds = uploadStore.files.filter(f => f.status === 'success').map(f => f.id)
    await compressionStore.batchCompress(fileIds)
    selectedIds.value = []
    ElMessage.success('批量压缩完成！')
  } catch (error) {
    errorMessage.value = '批量压缩失败，请重试'
    ElMessage.error('批量压缩失败')
  }
}

// 处理下载结果
const handleDownloadResults = () => {
  if (compressionStore.results.length === 0) {
    ElMessage.warning('没有压缩结果可下载')
    return
  }

  if (compressionStore.results.length === 1) {
    // 单张下载
    const result = compressionStore.results[0]
    compressionStore.downloadFile(result.id, getDownloadFileName(result))
  } else {
    // 批量下载
    const ids = compressionStore.results.map(r => r.id)
    compressionStore.downloadBatch(ids, `compressed_images_${Date.now()}.zip`)
  }
}

// 处理清除结果
const handleClearResults = () => {
  compressionStore.clearResults()
  selectedResult.value = null
  ElMessage.success('压缩结果已清除')
}

// 选择结果进行预览
const selectResult = (result: CompressionResult) => {
  selectedResult.value = result
}

// 下载单个结果
const downloadSingleResult = (result: CompressionResult) => {
  compressionStore.downloadFile(result.id, getDownloadFileName(result))
}

// 获取下载文件名
const getDownloadFileName = (result: CompressionResult): string => {
  // 从 previewUrl 中获取文件扩展名
  const fileNameFromPreview = result.previewUrl.split('/').pop()
  const extension = fileNameFromPreview ? fileNameFromPreview.split('.').pop() : 'jpg'
  
  // 生成文件名
  const baseName = result.originalName ? result.originalName.replace(/\.[^/.]+$/, '') : 'image'
  return `${baseName}_compressed.${extension}`
}

// 保存压缩设置
const saveCompressionSettings = () => {
  // 这里实现保存压缩设置逻辑
  console.log('保存压缩设置:', compressionSettings.value)
  // 更新压缩设置到压缩Store
  compressionStore.updateSettings(compressionSettings.value)
  // 模拟保存成功
  ElMessage.success('压缩设置已保存')
  showCompressionSettings.value = false
}

// 获取原始图片URL
const getOriginalImageUrl = (result: CompressionResult) => {
  // 尝试从上传文件中找到对应的原始图片预览
  // 注意：result.originalName可能是undefined，所以需要额外处理
  if (result.originalName) {
    const originalFile = uploadStore.files.find(f => f.name === result.originalName)
    // 如果找到，返回预览URL
    if (originalFile?.preview) {
      console.log('Found original image from upload store:', originalFile.preview.substring(0, 50) + '...')
      return originalFile.preview
    }
  }
  
  // 直接使用压缩后的图片作为原始图片的替代
  // 这样可以确保用户至少能看到图片，即使不是原始版本
  try {
    if (result.previewUrl) {
      const compressedUrl = `http://localhost:3000${result.previewUrl}`
      console.log('Using compressed image as original image:', compressedUrl)
      return compressedUrl
    }
  } catch (error) {
    console.error('Error using compressed image:', error)
  }
  
  // 如果所有尝试都失败，返回默认的占位符URL
  console.log('All attempts failed, returning placeholder')
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjQjBCMEIwIj7kuLvluqfliLDliqHpg73kuIDkuK3nqLygkNeQkQo8L3RleHQ+Cjwvc3ZnPg=='
}

// 格式化文件大小
const formatSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-section {
  margin-bottom: 24px;
}

.action-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.settings-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.results-section {
  margin-top: 24px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.result-item:hover {
  background-color: #f0f0f0;
}

.result-item.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.result-size {
  font-size: 12px;
  color: #666;
}

.result-ratio {
  font-size: 12px;
  font-weight: 500;
  color: #52c41a;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.preview-btn, .download-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-btn {
  background-color: white;
  color: #1890ff;
  border-color: #1890ff;
}

.preview-btn:hover {
  background-color: #e6f7ff;
}

.download-btn {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.download-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}


</style>
