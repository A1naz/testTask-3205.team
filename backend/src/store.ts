import { randomUUID } from 'node:crypto';
import { Job, JobSummary } from './types';

const jobs = new Map<string, Job>();

export function createJob(urls: string[]): Job {
  const job: Job = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    urls: urls.map((url) => ({
      url,
      status: 'pending',
      httpStatus: null,
      error: null,
      startedAt: null,
      finishedAt: null,
      durationMs: null,
    })),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function listJobs(): JobSummary[] {
  return [...jobs.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toSummary);
}

export function toSummary(job: Job): JobSummary {
  const success = job.urls.filter((u) => u.status === 'success').length;
  const error = job.urls.filter((u) => u.status === 'error').length;
  const processed = job.urls.filter(
    (u) => u.status !== 'pending' && u.status !== 'in_progress',
  ).length;
  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: job.urls.length,
    success,
    error,
    processed,
  };
}
