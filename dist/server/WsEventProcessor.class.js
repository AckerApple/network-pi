"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventProcessor = exports.SocketSwitch = void 0;
const tslib_1 = require("tslib");
const ws_1 = require("ws");
const rxjs_1 = require("rxjs");
class SocketSwitch {
    constructor(wss) {
        this.wss = wss;
    }
    sendToAll(eventType, data, responseTo) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.OPEN) {
                new WsEventProcessor(client).send(eventType, data, responseTo);
            }
        });
    }
}
exports.SocketSwitch = SocketSwitch;
class WsEventProcessor {
    constructor(ws) {
        this.ws = ws;
        this.$message = new rxjs_1.Subject();
    }
    monitorMessages() {
        console.log('listening to messages on socket connection...');
        this.ws.on('message', (dataString) => this.onMessage(dataString));
        return this;
    }
    onMessage(dataString) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.parse(dataString);
                this.$message.next(data);
            }
            catch (e) {
                console.error(e);
                return;
            }
        });
    }
    send(eventType, data, responseTo) {
        const message = { eventType, data };
        if (responseTo === null || responseTo === void 0 ? void 0 : responseTo.responseId) {
            message.responseId = responseTo.responseId;
        }
        this.ws.send(JSON.stringify(message));
    }
}
exports.WsEventProcessor = WsEventProcessor;
//# sourceMappingURL=WsEventProcessor.class.js.map