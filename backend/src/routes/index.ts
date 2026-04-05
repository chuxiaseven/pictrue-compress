import express from 'express'
import uploadRoutes from './upload.route.js'
import compressionRoutes from './compression.route.js'
import historyRoutes from './history.route.js'
import settingsRoutes from './settings.route.js'

const router = express.Router()

router.use('/upload', uploadRoutes)
router.use('/compress', compressionRoutes)
router.use('/download', express.Router()) // 下载路由将在后续实现
router.use('/history', historyRoutes)
router.use('/settings', settingsRoutes)

export default router