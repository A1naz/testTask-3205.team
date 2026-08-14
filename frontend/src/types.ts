export type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type UrlStatus =
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'error'
  | 'cancelled'

export interface UrlCheck {
  url: string
  status: UrlStatus
  httpStatus: number | null
  error: string | null
  startedAt: string | null
  finishedAt: string | null
  durationMs: number | null
}

export interface JobSummary {
  id: string
  createdAt: string
  status: JobStatus
  total: number
  success: number
  error: number
  processed: number
}

export interface JobDetails extends JobSummary {
  urls: UrlCheck[]
}

export const TERMINAL_JOB_STATUSES: JobStatus[] = [
  'completed',
  'cancelled',
  'failed',
]

export function isTerminalStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status)
}
