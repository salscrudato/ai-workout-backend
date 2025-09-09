"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const tslib_1 = require("tslib");
const openai_1 = tslib_1.__importDefault(require("openai"));
const env_1 = require("../config/env");
exports.openai = new openai_1.default({ apiKey: env_1.env.OPENAI_API_KEY });
//# sourceMappingURL=openai.js.map