"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventMessageHandler = void 0;
const tslib_1 = require("tslib");
const WsEventProcessor_class_1 = require("./WsEventProcessor.class");
class WsEventMessageHandler extends WsEventProcessor_class_1.WsEventProcessor {
    processWsEventMessage(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this[data.eventType]) {
                const message = `received unknown command ${data.eventType}`;
                console.warn('unknown message', message);
                this.send('log', {
                    message, data
                }, data);
                return;
            }
            try {
                this[data.eventType].call(this, data);
            }
            catch (error) {
                this.send('log', {
                    message: `failed command ${data.eventType}`, error
                }, data);
            }
        });
    }
}
exports.WsEventMessageHandler = WsEventMessageHandler;
//# sourceMappingURL=WsEventMessageHandler.class.js.map