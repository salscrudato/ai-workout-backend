import { createHash } from 'crypto';
export function sha256(obj) {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj, Object.keys(obj).sort());
    return createHash('sha256').update(json).digest('hex');
}
//# sourceMappingURL=hash.js.map