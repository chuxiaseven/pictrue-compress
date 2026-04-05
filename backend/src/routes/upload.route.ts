import express from 'express'
import uploadController from '../controllers/upload.controller.js'
import uploadMiddleware from '../middleware/upload.js'

const router = express.Router()

router.post('/', uploadMiddleware.single('file'), uploadController.upload)
router.post('/batch', uploadMiddleware.array('files'), uploadController.batchUpload)

export default router