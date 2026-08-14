<script setup lang="ts">
import { useJobsStore } from '../stores/jobs'
import type { JobStatus } from '../types'

const store = useJobsStore()

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'В очереди',
  in_progress: 'Выполняется',
  completed: 'Завершено',
  cancelled: 'Отменено',
  failed: 'Ошибка',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU')
}
</script>

<template>
  <section class="panel">
    <div class="head">
      <h2>Задания</h2>
      <button class="refresh" :disabled="store.jobsLoading" @click="store.fetchJobs()">
        Обновить
      </button>
    </div>

    <p v-if="store.jobsError" class="error-text">{{ store.jobsError }}</p>
    <p v-else-if="store.jobs.length === 0" class="empty">
      {{ store.jobsLoading ? 'Загрузка…' : 'Заданий пока нет' }}
    </p>

    <ul class="list">
      <li
        v-for="job in store.jobs"
        :key="job.id"
        :class="{ active: job.id === store.activeJobId }"
        @click="store.selectJob(job.id)"
      >
        <div class="row">
          <code class="id">{{ job.id.slice(0, 8) }}</code>
          <span class="badge" :class="job.status">{{ STATUS_LABELS[job.status] }}</span>
        </div>
        <div class="row meta">
          <span>{{ formatDate(job.createdAt) }}</span>
          <span class="stats">
            <span class="ok">✓ {{ job.success }}</span>
            <span class="fail">✕ {{ job.error }}</span>
            <span>из {{ job.total }}</span>
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 5px 12px;
  font-size: 13px;
}

.refresh:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--accent);
}

.empty {
  color: var(--text-dim);
  font-size: 14px;
  margin: 4px 0 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.list li {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.list li:hover {
  background: var(--panel-hover);
}

.list li.active {
  border-color: var(--accent);
  background: var(--panel-hover);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.id {
  font-size: 13px;
  color: var(--text);
}

.meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-dim);
}

.stats {
  display: inline-flex;
  gap: 8px;
}

.ok {
  color: var(--success);
}

.fail {
  color: var(--error);
}
</style>
