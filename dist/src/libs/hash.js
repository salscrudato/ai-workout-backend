"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
const crypto_1 = require("crypto");
function sha256(obj) {
    const json = typeof obj === 'string' ? obj : JSON.stringify(obj, Object.keys(obj).sort());
    return (0, crypto_1.createHash)('sha256').update(json).digest('hex');
}
//# sourceMappingURL=hash.js.map