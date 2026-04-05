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
        <el-button type="info" @click="refreshHistory">刷新</el-button>
        <el-button type="danger" style="margin-left: 8px" @click="clearAll">清空历史记录</el-button>
      </div>
    </div>

    <!-- 历史记录网格 -->
    <div class="history-grid-section">
      <div v-loading="historyStore.isLoading" class="history-grid">
        <div v-for="record in pagedHistory" :key="record.id" class="history-item">
          <div class="image-preview">
            <img :src="(record.previewUrl ? 'http://localhost:3000' + record.previewUrl : '/placeholder.png')" :alt="record.fileName" />
          </div>
          <div class="image-info">
            <div class="file-name">{{ record.fileName }}</div>
            <div class="file-size">{{ formatSize(record.compressedSize) }}</div>
            <div class="file-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="downloadRecord(record)"
                circle
              >
                <el-icon><Download /></el-icon>
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="deleteRecord(record.id)"
                circle
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filteredHistory.length === 0 && !historyStore.isLoading" class="empty-list">
        暂无历史记录
      </div>
      
      <!-- 分页控件 -->
      <div v-if="filteredHistory.length > 0" class="pagination-section">
        <div class="pagination-content">
          <span class="record-count">共 {{ historyStore.records.length }} 条记录</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[8, 16, 24, 32]"
            layout="prev, pager, next, sizes"
            :total="filteredHistory.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import { Download, Delete } from '@element-plus/icons-vue'
import { useHistoryStore } from '../store'

const historyStore = useHistoryStore()

const searchKeyword = ref('')
const dateFilter = ref('all')
const nameFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const sortField = ref('timestamp')
const sortOrder = ref('descending')

onMounted(() => {
  historyStore.loadHistory()
})

const filteredHistory = computed(() => {
  let result = historyStore.records.filter(item => {
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
  
  // 排序
  if (sortField.value) {
    result.sort((a, b) => {
      let aValue = a[sortField.value as keyof typeof a]
      let bValue = b[sortField.value as keyof typeof b]
      
      // 处理日期类型
      if (sortField.value === 'timestamp') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }
      
      // 处理字符串类型
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder.value === 'ascending') {
        return (aValue || 0) > (bValue || 0) ? 1 : -1
      } else {
        return (aValue || 0) < (bValue || 0) ? 1 : -1
      }
    })
  }
  
  return result
})

const pagedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

const formatSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



const deleteRecord = async (id: string) => {
  await historyStore.deleteRecord(id)
  ElMessage.success('已删除')
  // 重新计算分页
  if (pagedHistory.value.length === 0 && currentPage.value > 1) {
    currentPage.value--
  }
}

const clearAll = async () => {
  await ElMessageBox.confirm('确定清空所有历史记录？', '提示', { type: 'warning' })
  await historyStore.clearAll()
  ElMessage.success('已清空')
  currentPage.value = 1
}

const refreshHistory = async () => {
  await historyStore.loadHistory()
  ElMessage.success('已刷新')
}

const downloadRecord = async (record: any) => {
  try {
    // 模拟下载功能
    if (record.downloadUrl) {
      window.open(record.downloadUrl, '_blank')
      ElMessage.success('下载已开始')
    } else {
      ElMessage.error('下载链接不存在')
    }
  } catch (error) {
    ElMessage.error('下载失败')
  }
}



const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
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

.history-grid-section {
  margin-bottom: 30px;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.history-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 100%;
  height: 150px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.image-info {
  padding: 10px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.file-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-list {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 16px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.pagination-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.record-count {
  font-size: 14px;
  color: #606266;
}

.file-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
</style>