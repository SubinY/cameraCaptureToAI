<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="app-container">
      <a-layout-header class="header">
        <div class="logo">DeepSeek Camera</div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="monitor">
            <router-link to="/monitor">实时监控</router-link>
          </a-menu-item>
          <a-menu-item key="statistics">
            <router-link to="/statistics">行为统计</router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const route = useRoute()
const selectedKeys = ref([route.name as string])
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 50px;
}

.logo {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-right: 50px;
}

.content {
  padding: 24px;
  background: #fff;
}
</style>