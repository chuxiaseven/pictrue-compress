import { Request, Response, NextFunction } from 'express'

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  
  // 处理 multer 上传错误
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message })
  }
  
  // 处理文件类型错误
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: err.message })
  }
  
  // 处理其他错误
  res.status(500).json({ error: 'Internal server error' })
}

export default errorMiddleware