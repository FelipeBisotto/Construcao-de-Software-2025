import type { Request, Response, NextFunction } from 'express';

interface HTTPError extends Error {
  status?: number;
}

export function errorHandler(err: HTTPError, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

