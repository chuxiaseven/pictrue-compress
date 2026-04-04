<template>
  <div class="history-container">
    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <el-input v-model="searchKeyword" placeholder="搜索文件名" clearable style="width: 300px; margin-right: 16px" />
      <div class="filter-buttons">
        <el-select v-model="dateFilter" placeholder="日期筛选" style="width: 120px; margin-right: 12px">
          <el-option label="今天" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="全部" value="all" />
        </el-select>
        <el-select v-model="nameFilter" placeholder="格式筛选" style="width: 120px; margin-right: 12px">
          <el-option label="JPEG" value="jpeg" />
          <el-option label="PNG" value="png" />
          <el-option label="WebP" value="webp" />
          <el-option label="全部" value="all" />
        </el-select>
        <el-button type="info" @click="exportHistory">导出历史</el-button>
        <el-button type="danger" style="margin-left: 8px" @click="clearAll">清空全部</el-button>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list-section">
      <el-table v-loading="historyStore.isLoading" :data="filteredHistory" style="width: 100%">
        <el-table-column prop="timestamp" label="日期时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.timestamp) }}</template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column label="原大小" width="100">
          <template #default="scope">{{ formatSize(scope.row.originalSize) }}</template>
        </el-table-column>
        <el-table-column label="压缩后大小" width="120">
          <template #default="scope">{{ formatSize(scope.row.compressedSize) }}</template>
        </el-table-column>
        <el-table-column label="压缩率" width="90">
          <template #default="scope">{{ Math.round((1 - scope.row.compressionRatio) * 100) }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteRecord(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="filteredHistory.length === 0 && !historyStore.isLoading" class="empty-list">
        暂无历史记录
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span>共 {{ historyStore.records.length }} 条记录</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHistoryStore } from '../store'

const historyStore = useHistoryStore()

const searchKeyword = ref('')
const dateFilter = ref('all')
const nameFilter = ref('all')

onMounted(() => {
  historyStore.loadHistory()
})

const filteredHistory = computed(() => {
  return historyStore.records.filter(item => {
    const matchesKeyword = item.fileName?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ?? true

    const now = new Date()
    const itemDate = new Date(item.timestamp)
    let matchesDate = true
    if (dateFilter.value === 'today') {
      matchesDate = itemDate.toDateString() === now.toDateString()
    } else if (dateFilter.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = itemDate >= weekAgo
    } else if (dateFilter.value === 'month') {
      matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    }

    const matchesName = nameFilter.value === 'all' ||
      (nameFilter.value === 'jpeg' && /\.(jpg|jpeg)$/i.test(item.fileName ?? '')) ||
      (nameFilter.value === 'png' && /\.png$/i.test(item.fileName ?? '')) ||
      (nameFilter.value === 'webp' && /\.webp$/i.test(item.fileName ?? ''))

    return matchesKeyword && matchesDate && matchesName
  })
})

const formatSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp: number | string): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const deleteRecord = async (id: string) => {
  await historyStore.deleteRecord(id)
  ElMessage.success('已删除')
}

const clearAll = async () => {
  await ElMessageBox.confirm('确定清空所有历史记录？', '提示', { type: 'warning' })
  await historyStore.clearAll()
  ElMessage.success('已清空')
}

const exportHistory = async () => {
  await historyStore.exportHistory()
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  align-items: center;
}

.history-list-section {
  margin-bottom: 30px;
}

.history-list-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.empty-list {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.status-bar {
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}
</style>