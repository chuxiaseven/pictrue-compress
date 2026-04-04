import fs from 'fs/promises'
import path from 'path'

const HISTORY_FILE = path.join(process.cwd(), 'history.json')

// 确保历史记录文件存在
const ensureHistoryFile = async () => {
  try {
    await fs.access(HISTORY_FILE)
  } catch {
    await fs.writeFile(HISTORY_FILE, JSON.stringify([]))
  }
}

const historyService = {
  async getHistory() {
    await ensureHistoryFile()
    
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to get history')
    }
  },

  async addHistory(record: any) {
    await ensureHistoryFile()
    
    try {
      const history = await this.getHistory()
      history.push({
        ...record,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      })
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2))
    } catch (error) {
      throw new Error('Failed to add history')
    }
  },

  async deleteHistory(id: string) {
    await ensureHistoryFile()
    
    try {
      let history = await this.getHistory()
      history = history.filter((record: any) => record.id !== id)
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2))
    } catch (error) {
      throw new Error('Failed to delete history')
    }
  },

  async clearHistory() {
    try {
      await fs.writeFile(HISTORY_FILE, JSON.stringify([]))
    } catch (error) {
      throw new Error('Failed to clear history')
    }
  },

  async exportHistory() {
    await ensureHistoryFile()
    
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to export history')
    }
  }
}

export default historyService