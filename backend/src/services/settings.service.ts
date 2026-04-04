import fs from 'fs/promises'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json')

// 默认设置
const defaultSettings = {
  general: {
    defaultQuality: 75,
    defaultPath: '',
    autoOpenFolder: true,
    autoCheckUpdate: false
  },
  theme: {
    themeMode: 'system'
  },
  language: {
    language: 'zh-CN'
  }
}

// 确保设置文件存在
const ensureSettingsFile = async () => {
  try {
    await fs.access(SETTINGS_FILE)
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2))
  }
}

const settingsService = {
  async getSettings() {
    await ensureSettingsFile()
    
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to get settings')
    }
  },

  async saveSettings(settings: any) {
    try {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    } catch (error) {
      throw new Error('Failed to save settings')
    }
  }
}

export default settingsService