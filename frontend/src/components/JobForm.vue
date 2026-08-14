<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJobsStore } from '../stores/jobs'

const store = useJobsStore()
const input = ref('https://vk.com\nhttps://habr.com\nhttps://asdkjaslkdj123.ru')

const urls = computed(() =>
  input.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)

async function submit(): Promise<void> {
  if (urls.value.length === 0 || store.creating) return
  const ok = await store.createJob(urls.value)
  if (ok) input.value = ''
}
</script>

<template>
  <section class="panel">
    <h2>Новое задание</h2>
    <textarea
      v-model="input"
      rows="6"
      placeholder="Каждый URL — с новой строки&#10;https://example.com&#10;https://google.com"
      spellcheck="false"
    ></textarea>
    <div class="footer">
      <span class="hint">URL: {{ urls.length }}</span>
      <button
        class="submit"
        :disabled="urls.length === 0 || store.creating"
        @click="submit"
      >
        {{ store.creating ? 'Отправка…' : 'Запустить проверку' }}
      </button>
    </div>
    <p v-if="store.createError" class="error-text">{{ store.createError }}</p>
  </section>
</template>

<style scoped>
textarea {
  width: 100%;
  resize: vertical;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
}

textarea:focus {
  border-color: var(--accent);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.hint {
  color: var(--text-dim);
  font-size: 13px;
}

.submit {
  background: var(--accent);
  color: #fff;
  padding: 9px 18px;
  font-weight: 600;
}

.submit:hover:not(:disabled) {
  background: var(--accent-hover);
}
</style>
