<template>
  <div class="compression-settings-section">
    <h3>压缩设置</h3>
    
    <!-- 压缩模式 -->
    <div class="setting-item">
      <label class="setting-label">压缩模式：</label>
      <div class="setting-content">
        <el-radio-group v-model="localSettings.mode" @change="handleModeChange">
          <el-radio-button label="light">
            <el-icon><Sunny /></el-icon>
            轻度压缩
          </el-radio-button>
          <el-radio-button label="medium">
            <el-icon><PartlyCloudyIcon /></el-icon>
            中度压缩
          </el-radio-button>
          <el-radio-button label="strong">
            <el-icon><Lightning /></el-icon>
            强力压缩
          </el-radio-button>
          <el-radio-button label="custom">
            <el-icon><Tools /></el-icon>
            自定义
          </el-radio-button>
        </el-radio-group>
        <p class="mode-description">{{ modeDescription }}</p>
      </div>
    </div>

    <!-- 压缩质量 -->
    <div class="setting-item">
      <label class="setting-label">压缩质量：</label>
      <div class="setting-content">
        <el-slider
          v-model="localSettings.quality"
          :min="1"
          :max="100"
          :disabled="localSettings.mode !== 'custom'"
          show-input
          :marks="{ 1: '1%', 50: '50%', 100: '100%' }"
        />
      </div>
    </div>

    <!-- 尺寸调整 -->
    <div class="setting-item">
      <label class="setting-label">尺寸调整：</label>
      <div class="setting-content">
        <el-checkbox v-model="enableResize">启用尺寸调整</el-checkbox>
        <div v-if="enableResize" class="resize-inputs">
          <el-input-number
            v-model="localSettings.width"
            :min="1"
            :max="8000"
            placeholder="宽度"
            :disabled="!enableResize"
          />
          <span class="resize-separator">×</span>
          <el-input-number
            v-model="localSettings.height"
            :min="1"
            :max="8000"
            placeholder="高度"
            :disabled="!enableResize"
          />
          <el-checkbox v-model="localSettings.keepRatio" :disabled="!enableResize">
            锁定宽高比
          </el-checkbox>
        </div>
      </div>
    </div>

    <!-- 输出格式 -->
    <div class="setting-item">
      <label class="setting-label">输出格式：</label>
      <div class="setting-content">
        <el-select v-model="localSettings.format" style="width: 150px">
          <el-option label="保持原格式" value="original" />
          <el-option label="JPEG" value="jpeg" />
          <el-option label="PNG" value="png" />
          <el-option label="WebP" value="webp" />
        </el-select>
        <span class="format-hint">{{ formatHint }}</span>
      </div>
    </div>

    <!-- 高级选项 -->
    <div class="setting-item">
      <label class="setting-label">高级选项：</label>
      <div class="setting-content">
        <el-checkbox v-model="localSettings.stripMetadata">
          去除元数据（EXIF、GPS 等）
        </el-checkbox>
      </div>
    </div>

    <!-- 压缩预估 -->
    <div class="compression-estimate" v-if="selectedCount > 0">
      <el-divider />
      <div class="estimate-content">
        <el-icon><Info-filled /></el-icon>
        <span>已选择 {{ selectedCount }} 张图片，预计压缩后文件大小减少 {{ estimateReduction }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Sunny, PartlyCloudy as PartlyCloudyIcon, Lightning, Tools } from '@element-plus/icons-vue'
import type { CompressionSettings } from '../../types'

const props = defineProps<{
  modelValue: CompressionSettings
  selectedCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [settings: CompressionSettings]
}>()

const localSettings = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const enableResize = ref(false)

const modeDescription = computed(() => {
  const descriptions: Record<string, string> = {
    light: '质量 85-90%，文件体积减少约 20-30%，适合需要保持高质量的场景',
    medium: '质量 70-75%，文件体积减少约 40-50%，平衡质量与体积',
    strong: '质量 50-60%，文件体积减少约 60-70%，适合对文件大小敏感的场景',
    custom: '自定义压缩参数，根据需求灵活调整'
  }
  return descriptions[localSettings.value.mode] || ''
})

const formatHint = computed(() => {
  const hints: Record<string, string> = {
    original: '保持图片原始格式',
    jpeg: '适合照片，压缩率高，不支持透明',
    png: '适合图标、截图，支持透明，无损压缩',
    webp: '现代格式，压缩率更高，兼容性较好'
  }
  return hints[localSettings.value.format] || ''
})

const estimateReduction = computed(() => {
  const estimates: Record<string, number> = {
    light: 25,
    medium: 45,
    strong: 65,
    custom: Math.round((100 - localSettings.value.quality) * 0.6)
  }
  return estimates[localSettings.value.mode] || 45
})

const handleModeChange = (mode: string) => {
  const qualityMap: Record<string, number> = {
    light: 85,
    medium: 75,
    strong: 55,
    custom: localSettings.value.quality
  }
  localSettings.value.quality = qualityMap[mode] || 75
}

watch(enableResize, (val) => {
  if (!val) {
    localSettings.value.width = undefined
    localSettings.value.height = undefined
  }
})
</script>

<style scoped>
.compression-settings-section {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.compression-settings-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.setting-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}

.setting-content {
  flex: 1;
}

.mode-description {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #909399;
}

.resize-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.resize-separator {
  color: #909399;
  font-size: 14px;
}

.format-hint {
  margin-left: 12px;
  font-size: 13px;
  color: #909399;
}

.compression-estimate {
  margin-top: 16px;
}

.estimate-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}
</style>
