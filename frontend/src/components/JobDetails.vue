<script setup lang="ts">
import { computed } from 'vue'
import { useJobsStore } from '../stores/jobs'
import { isTerminalStatus } from '../types'
import type { JobStatus, UrlStatus } from '../types'

const store = useJobsStore()

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'В очереди',
  in_progress: 'Выполняется',
  completed: 'Завершено',
  cancelled: 'Отменено',
  failed: 'Ошибка',
}

const URL_STATUS_LABELS: Record<UrlStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'Проверяется',
  success: 'Успех',
  error: 'Ошибка',
  cancelled: 'Отменён',
}

const progressPercent = computed(() => {
  const job = store.activeJob
  if (!job || job.total === 0) return 0
  return Math.round((job.processed / job.total) * 100)
})

const canCancel = computed(() => {
  const job = store.activeJob
  return job !== null && !isTerminalStatus(job.status)
})

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  return ms < 1000 ? `${ms} мс` : `${(ms / 1000).toFixed(1)} с`
}

function formatTime(iso: string | null): string {
  if (iso === null) return '—'
  return new Date(iso).toLocaleTimeString('ru-RU')
}
</script>

<template>
  <section class="panel">
    <h2>Активное задание</h2>

    <p v-if="!store.activeJobId" class="empty">
      Создайте новое задание или выберите его из списка
    </p>

    <template v-else>
      <p v-if="store.detailsError" class="error-text">{{ store.detailsError }}</p>
      <p v-else-if="store.detailsLoading && !store.activeJob" class="empty">Загрузка…</p>

      <template v-if="store.activeJob">
        <div class="summary">
          <code class="id">{{ store.activeJob.id }}</code>
          <span class="badge" :class="store.activeJob.status">
            {{ JOB_STATUS_LABELS[store.activeJob.status] }}
          </span>
          <button v-if="canCancel" class="cancel" :disabled="store.cancelling" @click="store.cancelActiveJob()">
            {{ store.cancelling ? 'Отмена…' : 'Отменить задание' }}
          </button>
        </div>

        <div class="progress">
          <div class="progress-label">
            {{ store.activeJob.processed }} из {{ store.activeJob.total }} обработано
            <span class="stats">
              (<span class="ok">✓ {{ store.activeJob.success }}</span> /
              <span class="fail">✕ {{ store.activeJob.error }}</span>)
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Статус</th>
                <th>HTTP</th>
                <th>Начало</th>
                <th>Длительность</th>
                <th>Ошибка</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="check in store.activeJob.urls" :key="check.url + check.startedAt">
                <td class="url" :title="check.url">{{ check.url }}</td>
                <td>
                  <span class="badge" :class="check.status">
                    {{ URL_STATUS_LABELS[check.status] }}
                  </span>
                </td>
                <td>{{ check.httpStatus ?? '—' }}</td>
                <td class="dim">{{ formatTime(check.startedAt) }}</td>
                <td class="dim">{{ formatDuration(check.durationMs) }}</td>
                <td class="err" :title="check.error ?? ''">{{ check.error ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.empty {
  color: var(--text-dim);
  font-size: 14px;
  margin: 4px 0 0;
}

.summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.id {
  font-size: 13px;
  color: var(--text-dim);
}

.cancel {
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--error);
  color: var(--error);
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
}

.cancel:hover:not(:disabled) {
  background: rgba(240, 97, 109, 0.12);
}

.progress {
  margin: 16px 0;
}

.progress-label {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.stats .ok {
  color: var(--success);
}

.stats .fail {
  color: var(--error);
}

.progress-bar {
  height: 8px;
  background: var(--bg);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  text-align: left;
  color: var(--text-dim);
  font-weight: 600;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.url {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dim {
  color: var(--text-dim);
  white-space: nowrap;
}

.err {
  color: var(--error);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
