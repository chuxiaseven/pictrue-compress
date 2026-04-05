import { Request, Response } from 'express'
import settingsService from '../services/settings.service.js'

const settingsController = {
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await settingsService.getSettings()
      res.json(settings)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get settings' })
    }
  },

  async saveSettings(req: Request, res: Response) {
    try {
      const settings = req.body
      await settingsService.saveSettings(settings)
      res.json({ message: 'Settings saved successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to save settings' })
    }
  }
}

export default settingsController