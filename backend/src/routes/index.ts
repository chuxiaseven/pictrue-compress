import express from 'express'
import uploadRoutes from './upload.route'
import compressionRoutes from './compression.route'
import historyRoutes from './history.route'
import settingsRoutes from './settings.route'

const router = express.Router()

router.use('/upload', uploadRoutes)
router.use('/compress', compressionRoutes)
router.use('/download', express.Router()) // 下载路由将在后续实现
router.use('/history', historyRoutes)
router.use('/settings', settingsRoutes)

export default router