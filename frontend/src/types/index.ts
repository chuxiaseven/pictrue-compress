// 上传文件类型
export interface UploadFile {
  id: string
  file: File
  name: string
  preview: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
}

// 压缩设置类型
export interface CompressionSettings {
  quality: number
  mode: 'light' | 'medium' | 'strong' | 'custom'
  width?: number
  height?: number
  keepRatio: boolean
  format: 'jpeg' | 'png' | 'webp' | 'original'
  stripMetadata: boolean
}

// 压缩结果类型
export interface CompressionResult {
  id: string
  originalName: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  downloadUrl: string
  previewUrl: string
}

// 历史记录类型
export interface HistoryRecord {
  id: string
  fileName: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  quality: number
  mode: string
  timestamp: number
  format: string
  downloadUrl?: string
  previewUrl?: string
}

// 应用设置类型
export interface AppSettings {
  defaultQuality: number
  defaultSavePath: string
  autoOpenFolder: boolean
  autoCheckUpdate: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'zh-TW' | 'en-US'
  compression: CompressionSettings
}

// 压缩进度类型
export interface CompressionProgress {
  total: number
  current: number
  percentage: number
  currentFile: string
  status: 'idle' | 'compressing' | 'completed' | 'error'
}
