import axios from 'axios'
import type { CompressionSettings, AppSettings } from '../types'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 上传 API
export const uploadApi = {
  // 上传单个文件
  uploadFile: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': undefined
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },

  // 批量上传
  uploadBatch: (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    return api.post('/upload/batch', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  }
}

// 压缩 API
export const compressionApi = {
  // 压缩单个文件
  compress: (fileId: string, settings: CompressionSettings) => {
    return api.post('/compress', {
      fileId,
      quality: settings.quality,
      mode: settings.mode,
      resize: settings.width && settings.height ? {
        width: settings.width,
        height: settings.height,
        keepRatio: settings.keepRatio
      } : null,
      format: settings.format,
      stripMetadata: settings.stripMetadata
    })
  },

  // 批量压缩
  batchCompress: (fileIds: string[], settings: CompressionSettings) => {
    return api.post('/compress/batch', {
      fileIds,
      config: {
        quality: settings.quality,
        mode: settings.mode,
        resize: settings.width && settings.height ? {
          width: settings.width,
          height: settings.height,
          keepRatio: settings.keepRatio
        } : null,
        format: settings.format,
        stripMetadata: settings.stripMetadata
      }
    })
  },

  // 获取压缩状态
  getStatus: (id: string) => {
    return api.get(`/compress/status/${id}`)
  }
}

// 下载 API
export const downloadApi = {
  // 下载单个文件
  downloadFile: (id: string) => {
    return api.get(`/download/${id}`, {
      responseType: 'blob'
    })
  },

  // 批量下载
  downloadBatch: (ids: string[]) => {
    return api.post('/download/batch', { ids }, {
      responseType: 'blob'
    })
  }
}

// 历史记录 API
export const historyApi = {
  // 获取历史记录
  getHistory: () => {
    return api.get('/history')
  },

  // 删除历史记录
  deleteHistory: (id: string) => {
    return api.delete(`/history/${id}`)
  },

  // 清空历史记录
  clearHistory: () => {
    return api.delete('/history')
  },

  // 导出历史记录
  exportHistory: () => {
    return api.get('/history/export', {
      responseType: 'blob'
    })
  }
}

// 设置 API
export const settingsApi = {
  // 获取设置
  getSettings: () => {
    return api.get('/settings')
  },

  // 保存设置
  saveSettings: (settings: AppSettings) => {
    return api.post('/settings', settings)
  }
}

export default api
