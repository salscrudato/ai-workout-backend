import { createHash } from 'crypto';
export function sha256(obj: unknown) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj, Object.keys(obj as any).sort());
  return createHash('sha256').update(json).digest('hex');
}