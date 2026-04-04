import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

// 确保上传目录存在
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

const uploadService = {
  async uploadFile(file: any) {
    await ensureUploadDir()
    
    const fileId = uuidv4()
    const fileName = `${fileId}_${file.originalname}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    try {
      // 先复制文件到上传目录，再删除临时文件
      await fs.copyFile(file.path, filePath)
      await fs.unlink(file.path)
      
      return {
        id: fileId,
        name: file.originalname,
        path: filePath,
        size: file.size,
        mimeType: file.mimetype
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload file')
    }
  },

  async batchUploadFiles(files: any[]) {
    await ensureUploadDir()
    
    const results = await Promise.all(
      files.map(async (file) => {
        return this.uploadFile(file)
      })
    )
    
    return results
  }
}

export default uploadService