import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jobsApi } from '../api/jobs'
import { isTerminalStatus } from '../types'
import type { JobDetails, JobSummary } from '../types'

const POLL_INTERVAL_MS = 1500

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<JobSummary[]>([])
  const jobsLoading = ref(false)
  const jobsError = ref<string | null>(null)

  const activeJobId = ref<string | null>(null)
  const activeJob = ref<JobDetails | null>(null)
  const detailsLoading = ref(false)
  const detailsError = ref<string | null>(null)

  const creating = ref(false)
  const createError = ref<string | null>(null)
  const cancelling = ref(false)

  let pollToken = 0
  let pollTimer: number | null = null

  function stopPolling(): void {
    pollToken += 1
    if (pollTimer !== null) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function startPolling(): void {
    stopPolling()
    void poll(pollToken)
  }

  async function poll(token: number): Promise<void> {
    const id = activeJobId.value
    if (id === null || token !== pollToken) return
    try {
      const details = await jobsApi.get(id)
      if (token !== pollToken) return
      activeJob.value = details
      detailsError.value = null
      detailsLoading.value = false
      updateSummaryFromDetails(details)
      const hasInFlight = details.urls.some((u) => u.status === 'in_progress')
      if (isTerminalStatus(details.status) && !hasInFlight) return
    } catch (err) {
      if (token !== pollToken) return
      detailsLoading.value = false
      detailsError.value = toMessage(err)
    }
    pollTimer = window.setTimeout(() => void poll(token), POLL_INTERVAL_MS)
  }

  function updateSummaryFromDetails(details: JobDetails): void {
    const index = jobs.value.findIndex((j) => j.id === details.id)
    const summary: JobSummary = {
      id: details.id,
      createdAt: details.createdAt,
      status: details.status,
      total: details.total,
      success: details.success,
      error: details.error,
      processed: details.processed,
    }
    if (index >= 0) jobs.value[index] = summary
  }

  async function fetchJobs(): Promise<void> {
    jobsLoading.value = true
    try {
      jobs.value = await jobsApi.list()
      jobsError.value = null
    } catch (err) {
      jobsError.value = toMessage(err)
    } finally {
      jobsLoading.value = false
    }
  }

  async function createJob(urls: string[]): Promise<boolean> {
    creating.value = true
    createError.value = null
    try {
      const { jobId } = await jobsApi.create(urls)
      selectJob(jobId)
      void fetchJobs()
      return true
    } catch (err) {
      createError.value = toMessage(err)
      return false
    } finally {
      creating.value = false
    }
  }

  function selectJob(id: string): void {
    if (activeJobId.value === id) return
    activeJobId.value = id
    activeJob.value = null
    detailsError.value = null
    detailsLoading.value = true
    startPolling()
  }

  async function cancelActiveJob(): Promise<void> {
    const id = activeJobId.value
    if (id === null || cancelling.value) return
    cancelling.value = true
    try {
      const details = await jobsApi.cancel(id)
      if (activeJobId.value === id) {
        activeJob.value = details
        detailsError.value = null
      }
      updateSummaryFromDetails(details)
      if (activeJobId.value === id) startPolling()
    } catch (err) {
      if (activeJobId.value === id) detailsError.value = toMessage(err)
    } finally {
      cancelling.value = false
    }
  }

  return {
    jobs,
    jobsLoading,
    jobsError,
    activeJobId,
    activeJob,
    detailsLoading,
    detailsError,
    creating,
    createError,
    cancelling,
    fetchJobs,
    createJob,
    selectJob,
    cancelActiveJob,
  }
})

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
