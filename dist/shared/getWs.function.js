"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWs = void 0;
const tslib_1 = require("tslib");
const isWsNeeded = typeof WebSocket === 'undefined';
function getWs() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (isWsNeeded) {
            // const ws = await import('ws') // causes Angular to guess it needs ws
            const ws = require('ws');
            return ws;
        }
        return WebSocket;
    });
}
exports.getWs = getWs;
//# sourceMappingURL=getWs.function.js.map