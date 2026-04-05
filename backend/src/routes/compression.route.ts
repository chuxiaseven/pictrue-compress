import express from 'express'
import compressionController from '../controllers/compression.controller.js'

const router = express.Router()

router.post('/', compressionController.compress)
router.post('/batch', compressionController.batchCompress)
router.get('/status/:id', compressionController.getStatus)

export default router