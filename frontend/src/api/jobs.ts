import type { JobDetails, JobSummary } from '../types'

const BASE = '/api/jobs'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = (await response.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {}
    throw new Error(message)
  }
  return (await response.json()) as T
}

export const jobsApi = {
  create(urls: string[]): Promise<{ jobId: string }> {
    return request(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    })
  },

  list(): Promise<JobSummary[]> {
    return request(BASE)
  },

  get(id: string): Promise<JobDetails> {
    return request(`${BASE}/${encodeURIComponent(id)}`)
  },

  cancel(id: string): Promise<JobDetails> {
    return request(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
