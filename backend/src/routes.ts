import { Router, Request, Response } from 'express';
import { createJob, getJob, listJobs, toSummary } from './store';
import { startProcessing } from './processor';

export const jobsRouter = Router();

jobsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body as { urls?: unknown };
  if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
    res.status(400).json({ error: '"urls" must be a non-empty array of strings' });
    return;
  }
  const urls = body.urls.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
  if (urls.length === 0) {
    res.status(400).json({ error: '"urls" must contain at least one non-empty string' });
    return;
  }
  const invalid = urls.filter((u) => !isValidHttpUrl(u));
  if (invalid.length > 0) {
    res.status(400).json({ error: 'Invalid URLs (must be absolute http/https)', invalid });
    return;
  }

  const job = createJob(urls);
  startProcessing(job);
  res.status(201).json({ jobId: job.id });
});

jobsRouter.get('/', (_req: Request, res: Response) => {
  res.json(listJobs());
});

jobsRouter.get('/:id', (req: Request, res: Response) => {
  const job = getJob(String(req.params.id));
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({ ...toSummary(job), urls: job.urls });
});

jobsRouter.delete('/:id', (req: Request, res: Response) => {
  const job = getJob(String(req.params.id));
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
    res.status(409).json({ error: `Job is already ${job.status}` });
    return;
  }

  job.status = 'cancelled';
  for (const url of job.urls) {
    if (url.status === 'pending') url.status = 'cancelled';
  }
  res.json({ ...toSummary(job), urls: job.urls });
});

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
