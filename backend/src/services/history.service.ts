import fs from 'fs/promises'
import path from 'path'

const HISTORY_FILE = path.join(process.cwd(), 'history.json')

// 确保历史记录文件存在
const ensureHistoryFile = async () => {
  try {
    // 确保目录存在
    const dir = path.dirname(HISTORY_FILE)
    await fs.mkdir(dir, { recursive: true })
    
    try {
      await fs.access(HISTORY_FILE)
    } catch {
      await fs.writeFile(HISTORY_FILE, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Error ensuring history file:', error)
    throw new Error('Failed to ensure history file exists')
  }
}

const historyService = {
  async getHistory() {
    await ensureHistoryFile()
    
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8')
      try {
        return JSON.parse(data)
      } catch (parseError) {
        console.error('Error parsing history file:', parseError)
        // 如果文件解析失败，重置为空白数组
        await fs.writeFile(HISTORY_FILE, JSON.stringify([]))
        return []
      }
    } catch (error) {
      console.error('Error reading history file:', error)
      throw new Error('Failed to get history')
    }
  },

  async addHistory(record: any) {
    await ensureHistoryFile()
    
    try {
      // 验证记录数据
      if (!record || typeof record !== 'object') {
        throw new Error('Invalid history record')
      }
      
      const history = await this.getHistory()
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
      history.push(newRecord)
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2))
      return newRecord
    } catch (error) {
      console.error('Error adding history:', error)
      throw new Error('Failed to add history')
    }
  },

  async deleteHistory(id: string) {
    await ensureHistoryFile()
    
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid history ID')
      }
      
      let history = await this.getHistory()
      const initialLength = history.length
      history = history.filter((record: any) => record.id !== id)
      
      if (history.length === initialLength) {
        throw new Error('History record not found')
      }
      
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('Error deleting history:', error)
      throw new Error('Failed to delete history')
    }
  },

  async clearHistory() {
    try {
      await ensureHistoryFile()
      await fs.writeFile(HISTORY_FILE, JSON.stringify([]))
    } catch (error) {
      console.error('Error clearing history:', error)
      throw new Error('Failed to clear history')
    }
  },

  async exportHistory() {
    await ensureHistoryFile()
    
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf8')
      try {
        return JSON.parse(data)
      } catch (parseError) {
        console.error('Error parsing history file for export:', parseError)
        return []
      }
    } catch (error) {
      console.error('Error exporting history:', error)
      throw new Error('Failed to export history')
    }
  }
}

export default historyService