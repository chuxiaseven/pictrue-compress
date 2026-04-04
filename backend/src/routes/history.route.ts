import express from 'express'
import historyController from '../controllers/history.controller'

const router = express.Router()

router.get('/', historyController.getHistory)
router.delete('/:id', historyController.deleteHistory)
router.delete('/', historyController.clearHistory)
router.get('/export', historyController.exportHistory)

export default router