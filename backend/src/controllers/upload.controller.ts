import { Request, Response } from 'express'
import uploadService from '../services/upload.service'

const uploadController = {
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }
      
      const result = await uploadService.uploadFile(req.file)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' })
    }
  },

  async batchUpload(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: 'No files uploaded' })
      }
      
      const results = await uploadService.batchUploadFiles(req.files)
      res.json(results)
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload files' })
    }
  }
}

export default uploadController