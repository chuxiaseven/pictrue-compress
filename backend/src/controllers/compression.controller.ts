import { Request, Response } from 'express'
import compressionService from '../services/compression.service.js'

const compressionController = {
  async compress(req: Request, res: Response) {
    try {
      const { fileId, quality, mode, resize, format, stripMetadata } = req.body
      
      const result = await compressionService.compressFile(fileId, {
        quality,
        mode,
        resize,
        format,
        stripMetadata
      })
      
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Failed to compress file' })
    }
  },

  async batchCompress(req: Request, res: Response) {
    try {
      const { fileIds, config } = req.body
      
      const result = await compressionService.batchCompressFiles(fileIds, config)
      
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Failed to compress files' })
    }
  },

  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const status = await compressionService.getCompressionStatus(id as string)
      
      res.json(status)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get compression status' })
    }
  }
}

export default compressionController