import { Request, Response } from 'express'
import historyService from '../services/history.service'

const historyController = {
  async getHistory(req: Request, res: Response) {
    try {
      const history = await historyService.getHistory()
      res.json(history)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get history' })
    }
  },

  async deleteHistory(req: Request, res: Response) {
    try {
      const { id } = req.params
      await historyService.deleteHistory(id as string)
      res.json({ message: 'History deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete history' })
    }
  },

  async clearHistory(req: Request, res: Response) {
    try {
      await historyService.clearHistory()
      res.json({ message: 'History cleared successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear history' })
    }
  },

  async exportHistory(req: Request, res: Response) {
    try {
      const data = await historyService.exportHistory()
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename=history.json')
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to export history' })
    }
  }
}

export default historyController