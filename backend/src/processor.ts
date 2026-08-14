import { Job, UrlCheck } from './types';

const isCancelled = (job: Job): boolean => job.status === 'cancelled';

const CONCURRENCY_PER_JOB = 5;
const HEAD_TIMEOUT_MS = 15_000;
const MAX_ARTIFICIAL_DELAY_MS = 10_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function startProcessing(job: Job): void {
  void runJob(job).catch((err) => {
    job.status = 'failed';
    console.error(`Job ${job.id} failed unexpectedly:`, err);
  });
}

async function runJob(job: Job): Promise<void> {
  job.status = 'in_progress';

  let nextIndex = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      if (isCancelled(job)) return;
      const index = nextIndex++;
      if (index >= job.urls.length) return;
      await processUrl(job.urls[index]);
    }
  };

  const workers = Array.from(
    { length: Math.min(CONCURRENCY_PER_JOB, job.urls.length) },
    () => worker(),
  );
  await Promise.all(workers);

  if (isCancelled(job)) return;
  const allFailed = job.urls.every((u) => u.status === 'error');
  job.status = allFailed ? 'failed' : 'completed';
}

async function processUrl(check: UrlCheck): Promise<void> {
  check.status = 'in_progress';
  const startedAt = Date.now();
  check.startedAt = new Date(startedAt).toISOString();

  let httpStatus: number | null = null;
  let error: string | null = null;

  try {
    const response = await fetch(check.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
    });
    httpStatus = response.status;
    if (!response.ok) {
      error = `HTTP ${response.status} ${response.statusText}`.trim();
    }
  } catch (err) {
    error = describeFetchError(err);
  }

  await sleep(Math.random() * MAX_ARTIFICIAL_DELAY_MS);

  const finishedAt = Date.now();
  check.httpStatus = httpStatus;
  check.error = error;
  check.status = error === null ? 'success' : 'error';
  check.finishedAt = new Date(finishedAt).toISOString();
  check.durationMs = finishedAt - startedAt;
}

function describeFetchError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'TimeoutError') {
      return `Request timed out after ${HEAD_TIMEOUT_MS} ms`;
    }
    const cause = (err as { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message) {
      return cause.message;
    }
    return err.message || err.name;
  }
  return String(err);
}
