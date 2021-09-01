"use strict";
/** this may belong in shared */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventMessageHandler = void 0;
const tslib_1 = require("tslib");
const WsEventProcessor_class_1 = require("./WsEventProcessor.class");
class WsEventMessageHandler extends WsEventProcessor_class_1.WsEventProcessor {
    processWsEventMessage(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const check = this[data.eventType];
            if (!check) {
                const message = `received unknown command ${data.eventType}`;
                console.warn('unknown message', message);
                this.send('log', {
                    message, data
                }, data);
                return;
            }
            try {
                const method = this[data.eventType];
                method.call(this, data);
            }
            catch (err) {
                this.send('log', {
                    message: `failed command ${data.eventType}`,
                    error: Object.getOwnPropertyNames(err).reverse().reduce((a, key) => (a[key] = err[key]) && a || a, {})
                }, data);
            }
        });
    }
}
exports.WsEventMessageHandler = WsEventMessageHandler;
//# sourceMappingURL=WsEventMessageHandler.class.js.map