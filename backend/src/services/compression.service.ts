import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import historyService from './history.service.js'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const COMPRESSED_DIR = path.join(UPLOAD_DIR, 'compressed')

// 确保压缩目录存在
const ensureCompressedDir = async () => {
  try {
    await fs.access(COMPRESSED_DIR)
  } catch {
    await fs.mkdir(COMPRESSED_DIR, { recursive: true })
  }
}

const compressionService = {
  async compressFile(fileId: string, config: any) {
    await ensureCompressedDir()

    console.log('Compressing file with ID:', fileId)

    // 查找原始文件 - 适配multer生成的文件名格式
    const files = await fs.readdir(UPLOAD_DIR)
    console.log('Files in upload directory:', files)
    const originalFile = files.find(file => file.includes(fileId))

    if (!originalFile) {
      console.error('File not found for ID:', fileId)
      throw new Error('File not found')
    }

    const originalPath = path.join(UPLOAD_DIR, originalFile)
    console.log('Original file path:', originalPath)
    const originalStats = await fs.stat(originalPath)

    // 生成压缩文件名
    const compressedId = uuidv4()
    // 提取原始文件名（去掉UUID前缀）
    const firstUnderscoreIndex = originalFile.indexOf('_')
    const originalName = firstUnderscoreIndex !== -1 ? originalFile.substring(firstUnderscoreIndex + 1) : originalFile
    
    // 根据输出格式更新文件名扩展名
    let compressedName
    if (config.format && config.format !== 'original') {
      // 如果指定了格式，使用指定的格式作为扩展名
      const baseName = path.basename(originalName, path.extname(originalName))
      compressedName = `${compressedId}_compressed_${baseName}.${config.format}`
    } else {
      // 如果使用原始格式，保持原始扩展名
      compressedName = `${compressedId}_compressed_${originalName}`
    }
    
    const compressedPath = path.join(COMPRESSED_DIR, compressedName)
    console.log('Compressed file path:', compressedPath)
    
    try {
      // 使用 Sharp 进行压缩
      let image = sharp(originalPath)
      
      // 尺寸调整
      if (config.resize) {
        const { width, height, keepRatio } = config.resize
        if (keepRatio) {
          image = image.resize(width, height, { fit: 'inside' })
        } else {
          image = image.resize(width, height)
        }
      }
      
      // 格式转换
      let outputFormat = config.format || 'webp'
      if (config.format === 'original') {
        // 尝试从原始文件名中提取格式
        const originalExt = path.extname(originalFile).toLowerCase().substring(1)
        if (['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(originalExt)) {
          outputFormat = originalExt === 'jpg' ? 'jpeg' : originalExt
        } else {
          outputFormat = 'webp'
        }
      }

      switch (outputFormat) {
        case 'jpeg':
          image = image.jpeg({ quality: config.quality || 75 })
          break
        case 'png':
          image = image.png({ quality: config.quality || 75 })
          break
        case 'webp':
          image = image.webp({ quality: config.quality || 75 })
          break
      }
      
      // 去除元数据
      if (config.stripMetadata) {
        image = image.withMetadata({})
      }
      
      // 保存压缩后的文件
      await image.toFile(compressedPath)
      console.log('Compression completed successfully')
      
      const compressedStats = await fs.stat(compressedPath)
      
      const result = {
        id: compressedId,
        fileName: originalName,
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        compressionRatio: compressedStats.size / originalStats.size,
        downloadUrl: `/api/download/${compressedId}`,
        previewUrl: `/uploads/compressed/${compressedName}`,
        compressedPath
      }
      
      // 添加到历史记录
      await historyService.addHistory({
        fileName: originalName,
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        compressionRatio: compressedStats.size / originalStats.size,
        format: config.format || 'original',
        quality: config.quality || 75,
        downloadUrl: `/api/download/${compressedId}`,
        previewUrl: `/uploads/compressed/${compressedName}`
      })
      
      return result
    } catch (error) {
      console.error('Compression error:', error)
      throw new Error('Failed to compress file')
    }
  },

  async batchCompressFiles(fileIds: string[], config: any) {
    const results = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          const result = await this.compressFile(fileId, config)
          return { success: true, fileId, result }
        } catch (error) {
          return { success: false, fileId, error: 'Failed to compress file' }
        }
      })
    )
    
    const success = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    return {
      total: fileIds.length,
      success,
      failed,
      results
    }
  },

  async getCompressionStatus(id: string) {
    // 这里实现压缩状态查询逻辑
    return {
      id,
      status: 'completed',
      progress: 100
    }
  }
}

export default compressionService