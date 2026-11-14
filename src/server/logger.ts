import 'server-only';
import { randomUUID } from 'crypto';

type Level = 'info' | 'warn' | 'error';

export function createErrorId() {
  return randomUUID();
}

export function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export function jsonError(message: string, status: number, errorId = createErrorId()) {
  log('error', message, { errorId, status });
  return Response.json({ ok: false, error: message, errorId }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return Response.json({ ok: true, ...data }, { status });
}
