import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'
import errorMiddleware from './middleware/error'
import path from 'path'
import fs from 'fs/promises'

// 加载环境变量
dotenv.config()

const app = express()
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

// 配置中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 配置静态文件服务
app.use('/uploads', express.static(UPLOAD_DIR))

// 配置路由
app.use('/api', routes)

// 实现下载路由
app.get('/api/download/:id', async (req, res) => {
  try {
    const { id } = req.params
    // 查找压缩文件
    const compressedDir = path.join(UPLOAD_DIR, 'compressed')
    const compressedFiles = await fs.readdir(compressedDir)
    const file = compressedFiles.find(f => f.includes(id))
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    const filePath = path.join(compressedDir, file)
    
    // 提取文件扩展名，设置正确的Content-Type
    const ext = path.extname(file).toLowerCase()
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff'
    }
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream'
    
    // 设置响应头
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.replace(/^.+_compressed_/, '')}"`)
    
    res.sendFile(filePath)
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' })
  }
})

// 实现批量下载路由
app.post('/api/download/batch', async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'No file IDs provided' })
    }
    
    // 查找压缩文件
    const compressedDir = path.join(UPLOAD_DIR, 'compressed')
    const compressedFiles = await fs.readdir(compressedDir)
    
    // 导入 archiver
    const archiver = (await import('archiver')).default
    
    // 创建 ZIP 文件
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="compressed_images_${Date.now()}.zip"`)
    
    // 管道到响应
    archive.pipe(res)
    
    // 添加文件到 ZIP
    for (const id of ids) {
      const file = compressedFiles.find(f => f.includes(id))
      if (file) {
        const filePath = path.join(compressedDir, file)
        const fileName = file.replace(/^.+_compressed_/, '')
        archive.file(filePath, { name: fileName })
      }
    }
    
    // 完成 ZIP
    await archive.finalize()
  } catch (error) {
    console.error('Batch download error:', error)
    res.status(500).json({ error: 'Failed to download files' })
  }
})

// 错误处理中间件
app.use(errorMiddleware)

export default app