<template>
  <div class="settings-container">
    <!-- 设置内容 -->
    <div class="settings-content">
      <h2>设置</h2>
      
      <!-- 文件存储设置 -->
      <div class="settings-section">
        <h3>文件存储设置</h3>
        
        <!-- 压缩文件存放目录 -->
        <div class="setting-item">
          <label class="setting-label">压缩文件存放目录：</label>
          <div class="setting-content">
            <el-input v-model="settings.general.compressedPath" style="flex: 1; margin-right: 10px" />
            <el-button type="primary" @click="selectCompressedFolder">选择文件夹</el-button>
          </div>
          <div v-if="settings.general.compressedPath" class="setting-hint">
            已选择压缩文件存放目录: {{ settings.general.compressedPath }}
          </div>
          <div v-if="compressedFolderUpdated" class="setting-success">
            ✓ 已选择压缩文件存放目录并更新设置
          </div>
        </div>

        <!-- 下载文件目录 -->
        <div class="setting-item">
          <label class="setting-label">下载文件目录：</label>
          <div class="setting-content">
            <el-input v-model="settings.general.downloadPath" style="flex: 1; margin-right: 10px" />
            <el-button type="primary" @click="selectDownloadFolder">选择文件夹</el-button>
          </div>
          <div v-if="settings.general.downloadPath" class="setting-hint">
            已选择下载文件目录: {{ settings.general.downloadPath }}
          </div>
          <div v-if="downloadFolderUpdated" class="setting-success">
            ✓ 已选择下载文件目录并更新设置
          </div>
        </div>

        <!-- 文件命名规则 -->
        <div class="setting-item">
          <label class="setting-label">文件命名规则：</label>
          <div class="setting-content">
            <el-radio-group v-model="settings.general.namingRule">
              <el-radio label="original">使用原文件名</el-radio>
              <el-radio label="add_suffix">添加 _compressed 后缀</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 保存设置按钮 -->
      <div class="action-buttons">
        <el-button @click="restoreDefaults">恢复默认值</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'



// 设置数据
const settings = reactive({
  general: {
    compressedPath: '',
    downloadPath: '',
    namingRule: 'original' as 'original' | 'add_suffix'
  }
})

// 状态消息
const compressedFolderUpdated = ref(false)
const downloadFolderUpdated = ref(false)

// 选择压缩文件存放目录
const selectCompressedFolder = () => {
  // 这里实现文件夹选择逻辑
  settings.general.compressedPath = '/Users/username/Downloads/压缩'
  compressedFolderUpdated.value = true
  setTimeout(() => {
    compressedFolderUpdated.value = false
  }, 2000)
}

// 选择下载文件目录
const selectDownloadFolder = () => {
  // 这里实现文件夹选择逻辑
  settings.general.downloadPath = '/Users/username/Downloads/下载'
  downloadFolderUpdated.value = true
  setTimeout(() => {
    downloadFolderUpdated.value = false
  }, 2000)
}

// 恢复默认值
const restoreDefaults = () => {
  settings.general.compressedPath = ''
  settings.general.downloadPath = ''
  settings.general.namingRule = 'original'
}

// 保存设置
const saveSettings = () => {
  // 这里实现保存设置逻辑
  console.log('保存设置:', settings)
  // 模拟保存成功
  setTimeout(() => {
    alert('设置已保存')
  }, 500)
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.settings-content h2 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.settings-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 24px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.setting-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.setting-label {
  width: 150px;
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}

.setting-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-hint {
  margin-left: 150px;
  font-size: 13px;
  color: #909399;
}

.setting-success {
  margin-left: 150px;
  font-size: 13px;
  color: #67c23a;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>