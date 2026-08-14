<script setup lang="ts">
import { onMounted } from 'vue'
import { useJobsStore } from './stores/jobs'
import JobForm from './components/JobForm.vue'
import JobList from './components/JobList.vue'
import JobDetails from './components/JobDetails.vue'

const store = useJobsStore()

onMounted(() => {
  void store.fetchJobs()
})
</script>

<template>
  <header class="header">
    <h1>Проверка списка URL</h1>
    <p>Асинхронная проверка доступности URL через HTTP HEAD-запросы</p>
  </header>

  <main class="layout">
    <div class="column">
      <JobForm />
      <JobList />
    </div>
    <div class="column">
      <JobDetails />
    </div>
  </main>
</template>

<style scoped>
.header {
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin: 6px 0 0;
  color: var(--text-dim);
  font-size: 14px;
}

.layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
