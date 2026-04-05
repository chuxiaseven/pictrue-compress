import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UploadFile, CompressionSettings, CompressionResult, CompressionProgress, HistoryRecord, AppSettings } from '../types'
import { uploadApi, compressionApi, downloadApi, historyApi, settingsApi } from '../api'

// 上传 Store
export const useUploadStore = defineStore('upload', () => {
  const files = ref<UploadFile[]>([])
  const isUploading = ref(false)

  const addFiles = (newFiles: File[]) => {
    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (e) => {
        files.value.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          preview: e.target?.result as string,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (id: string) => {
    const index = files.value.findIndex(f => f.id === id)
    if (index > -1) {
      files.value.splice(index, 1)
    }
  }

  const clearFiles = () => {
    files.value = []
  }

  const uploadFile = async (id: string) => {
    const fileItem = files.value.find(f => f.id === id)
    if (!fileItem) return

    fileItem.status = 'uploading'
    try {
      const response = await uploadApi.uploadFile(fileItem.file, (progress) => {
        fileItem.progress = progress
      })
      // 使用后端返回的文件ID替换前端生成的临时ID
      fileItem.id = response.data.id
      fileItem.status = 'success'
      return response.data
    } catch (error) {
      console.error('Upload error:', error)
      fileItem.status = 'error'
      throw error
    }
  }

  const uploadAll = async () => {
    isUploading.value = true
    const pendingFiles = files.value.filter(f => f.status === 'pending')

    try {
      await Promise.all(pendingFiles.map(f => uploadFile(f.id)))
    } finally {
      isUploading.value = false
    }
  }

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFile,
    uploadAll
  }
})

// 压缩 Store
export const useCompressionStore = defineStore('compression', () => {
  const settings = ref<CompressionSettings>({
    quality: 75,
    mode: 'medium',
    width: undefined,
    height: undefined,
    keepRatio: true,
    format: 'original',
    stripMetadata: true
  })

  const results = ref<CompressionResult[]>([])
  const progress = ref<CompressionProgress>({
    total: 0,
    current: 0,
    percentage: 0,
    currentFile: '',
    status: 'idle'
  })

  const isCompressing = computed(() => progress.value.status === 'compressing')

  const updateSettings = (newSettings: Partial<CompressionSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  const compressFile = async (fileId: string) => {
    progress.value.status = 'compressing'
    try {
      const response = await compressionApi.compress(fileId, settings.value)
      results.value.push(response.data)
      return response.data
    } catch (error) {
      progress.value.status = 'error'
      throw error
    }
  }

  const batchCompress = async (fileIds: string[]) => {
    progress.value = {
      total: fileIds.length,
      current: 0,
      percentage: 0,
      currentFile: '',
      status: 'compressing'
    }

    try {
      const response = await compressionApi.batchCompress(fileIds, settings.value)
      // 从后端返回的结果中提取成功的压缩结果
      const successfulResults = response.data.results
        .filter((item: any) => item.success)
        .map((item: any) => item.result)
      results.value = [...results.value, ...successfulResults]
      progress.value.status = 'completed'
      progress.value.percentage = 100
      return response.data
    } catch (error) {
      progress.value.status = 'error'
      throw error
    }
  }

  const downloadFile = async (id: string, filename: string) => {
    const response = await downloadApi.downloadFile(id)
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
    // 添加下载完成提示
    setTimeout(() => {
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.success('下载完成！')
      })
    }, 1000)
  }

  const downloadBatch = async (ids: string[], filename: string) => {
    const response = await downloadApi.downloadBatch(ids)
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
    // 添加下载完成提示
    setTimeout(() => {
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.success('批量下载完成！')
      })
    }, 1000)
  }

  const clearResults = () => {
    results.value = []
    progress.value = {
      total: 0,
      current: 0,
      percentage: 0,
      currentFile: '',
      status: 'idle'
    }
  }

  return {
    settings,
    results,
    progress,
    isCompressing,
    updateSettings,
    compressFile,
    batchCompress,
    downloadFile,
    downloadBatch,
    clearResults
  }
})

// 历史记录 Store
export const useHistoryStore = defineStore('history', () => {
  const records = ref<HistoryRecord[]>([])
  const isLoading = ref(false)

  const loadHistory = async () => {
    isLoading.value = true
    try {
      const response = await historyApi.getHistory()
      records.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  const deleteRecord = async (id: string) => {
    await historyApi.deleteHistory(id)
    records.value = records.value.filter(r => r.id !== id)
  }

  const clearAll = async () => {
    await historyApi.clearHistory()
    records.value = []
  }

  const exportHistory = async () => {
    const response = await historyApi.exportHistory()
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `history_${Date.now()}.json`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return {
    records,
    isLoading,
    loadHistory,
    deleteRecord,
    clearAll,
    exportHistory
  }
})

// 设置 Store
export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    defaultQuality: 75,
    defaultSavePath: '',
    autoOpenFolder: false,
    autoCheckUpdate: true,
    theme: 'system',
    language: 'zh-CN',
    compression: {
      quality: 75,
      mode: 'medium',
      width: undefined,
      height: undefined,
      keepRatio: true,
      format: 'original',
      stripMetadata: true
    }
  })

  const isLoading = ref(false)

  const loadSettings = async () => {
    isLoading.value = true
    try {
      const response = await settingsApi.getSettings()
      settings.value = { ...settings.value, ...response.data }
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    await settingsApi.saveSettings(settings.value)
  }

  return {
    settings,
    isLoading,
    loadSettings,
    saveSettings
  }
})
