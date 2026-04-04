import express from 'express'
import settingsController from '../controllers/settings.controller'

const router = express.Router()

router.get('/', settingsController.getSettings)
router.post('/', settingsController.saveSettings)

export default router