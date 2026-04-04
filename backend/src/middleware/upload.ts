import multer from 'multer'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// 文件过滤
const fileFilter = (req: any, file: any, cb: any) => {
  // 只接受图片文件
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
})

export default upload