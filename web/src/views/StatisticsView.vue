<template>
  <div class="statistics-container">
    <a-row :gutter="24">
      <a-col :span="12">
        <a-card title="今日行为统计" class="chart-card">
          <div ref="behaviorPieChart" class="chart"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="行为趋势" class="chart-card">
          <div ref="behaviorLineChart" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="24" style="margin-top: 24px">
      <a-col :span="24">
        <a-card title="行为记录" class="table-card">
          <a-table
            :columns="columns"
            :data-source="behaviorRecords"
            :pagination="{ pageSize: 10 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getBehaviorColor(record.type)">
                  {{ getBehaviorDesc(record.type) }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import { io } from 'socket.io-client'

// WebSocket连接
const socket = ref<any>(null)

// 图表实例
const behaviorPieChart = ref<HTMLElement | null>(null)
const behaviorLineChart = ref<HTMLElement | null>(null)
let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null

// 行为记录数据
const behaviorRecords = ref([])

// 表格列定义
const columns = [
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    customRender: ({ text }: { text: number }) => new Date(text).toLocaleString()
  },
  {
    title: '行为类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '分析结果',
    dataIndex: 'analysis',
    key: 'analysis',
    ellipsis: true
  }
]

// 行为类型映射
const behaviorTypes = {
  1: { desc: '认真工作', color: 'green' },
  2: { desc: '吃东西', color: 'orange' },
  3: { desc: '喝水', color: 'blue' },
  4: { desc: '喝饮料', color: 'orange' },
  5: { desc: '玩手机', color: 'red' },
  6: { desc: '睡觉', color: 'red' },
  7: { desc: '其他行为', color: 'gray' }
}

// 获取行为描述
const getBehaviorDesc = (type: number) => {
  return behaviorTypes[type]?.desc || '未知行为'
}

// 获取行为颜色
const getBehaviorColor = (type: number) => {
  return behaviorTypes[type]?.color || 'gray'
}

// 初始化饼图
const initPieChart = () => {
  if (!behaviorPieChart.value) return
  
  pieChart = echarts.init(behaviorPieChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '行为统计',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(option)
}

// 初始化折线图
const initLineChart = () => {
  if (!behaviorLineChart.value) return
  
  lineChart = echarts.init(behaviorLineChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['工作', '吃东西', '喝水', '喝饮料', '玩手机', '睡觉', '其他']
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '工作',
        type: 'line',
        data: []
      },
      {
        name: '吃东西',
        type: 'line',
        data: []
      },
      {
        name: '喝水',
        type: 'line',
        data: []
      },
      {
        name: '喝饮料',
        type: 'line',
        data: []
      },
      {
        name: '玩手机',
        type: 'line',
        data: []
      },
      {
        name: '睡觉',
        type: 'line',
        data: []
      },
      {
        name: '其他',
        type: 'line',
        data: []
      }
    ]
  }
  lineChart.setOption(option)
}

// 更新图表数据
const updateCharts = (data: any) => {
  // 更新饼图
  if (pieChart) {
    const pieData = Object.entries(data.behaviorCounts).map(([type, count]) => ({
      name: getBehaviorDesc(Number(type)),
      value: count
    }))
    pieChart.setOption({
      series: [{ data: pieData }]
    })
  }

  // 更新折线图
  if (lineChart) {
    const lineData = data.behaviorTrends.map((trend: any) => ({
      name: getBehaviorDesc(trend.type),
      data: trend.data.map((item: any) => [item.time, item.count])
    }))
    lineChart.setOption({
      series: lineData
    })
  }

  // 更新表格数据
  behaviorRecords.value = data.records
}

// 初始化WebSocket连接
const initWebSocket = () => {
  socket.value = io('http://localhost:3001')

  socket.value.on('connect', () => {
    message.success('服务器连接成功')
    // 请求初始数据
    socket.value.emit('get_statistics')
  })

  socket.value.on('disconnect', () => {
    message.error('服务器连接断开')
  })

  socket.value.on('statistics_update', (data: any) => {
    updateCharts(data)
  })
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  initPieChart()
  initLineChart()
  initWebSocket()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
  pieChart?.dispose()
  lineChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-container {
  padding: 24px;
}

.chart-card,
.table-card {
  margin-bottom: 24px;
}

.chart {
  height: 400px;
}
</style>