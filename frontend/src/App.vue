<template>
  <div class="app-container">
    <header class="app-header">
      <h1>图片压缩工具</h1>
      <nav class="app-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/history" class="nav-link">历史记录</router-link>
        <el-button type="text" class="settings-btn" @click="showSettingsDialog = true">设置</el-button>
      </nav>
    </header>
    <main class="app-main">
      <router-view></router-view>
    </main>
    <footer class="app-footer">
      <p>© 2026 图片压缩工具</p>
    </footer>
    
    <!-- 设置弹窗 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="设置"
      width="800px"
      append-to-body
    >
      <Settings />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Settings from './views/Settings.vue'

const showSettingsDialog = ref(false)
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.app-header {
  background-color: #409EFF;
  color: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.app-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.settings-btn {
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.settings-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.app-footer {
  background-color: #f0f2f5;
  padding: 10px 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #e4e7ed;
}
</style>