<template>
  <div class="monitor-view">
    <a-row :gutter="24">
      <a-col :span="16">
        <a-card title="实时监控">
          <WebRTCCamera @analysis-result="handleAnalysisResult" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="当前行为">
          <p>{{ currentBehavior }}</p>
          <a-divider />
          <h4>行为统计</h4>
          <a-list :data-source="behaviorList" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <span>{{ getBehaviorName(item.key) }}: {{ item.count }}次</span>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WebRTCCamera from '@/components/WebRTCCamera.vue'

const currentBehavior = ref('')
const statistics = ref<any>({})

const behaviorList = computed(() => {
  return Object.entries(statistics.value).map(([key, value]: [string, any]) => ({
    key,
    count: value.count
  }))
})

const getBehaviorName = (key: string) => {
  const names: Record<string, string> = {
    work: '工作',
    eating: '吃东西',
    drinking_water: '喝水',
    drinking_beverage: '喝饮料',
    phone: '玩手机',
    sleeping: '睡觉',
    other: '其他'
  }
  return names[key] || key
}

const handleAnalysisResult = (result: any) => {
  if (result.result?.description !== currentBehavior.value) {
    currentBehavior.value = result.result?.description || ''
  }
  
  const newStats = result.statistics || {}
  const hasChanges = Object.keys(newStats).some(key => {
    return !statistics.value[key] || statistics.value[key].count !== newStats[key].count
  })
  
  if (hasChanges) {
    statistics.value = newStats
  }
}
</script>

<style scoped>
.monitor-view {
  padding: 24px;
}
</style>