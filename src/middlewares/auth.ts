import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function maybeApiKey(req: Request, res: Response, next: NextFunction) {
  // If no internal API key is configured, skip authentication
  if (!env.INTERNAL_API_KEY) return next();

  const key = req.header('X-API-Key');

  // If API key is configured but not provided in request, allow through
  // This makes the API key optional - only validate if provided
  if (!key) return next();

  // If API key is provided, it must match the configured key
  if (key !== env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}
