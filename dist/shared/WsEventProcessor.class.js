"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plainObject = exports.WsEventProcessor = exports.SocketSwitch = void 0;
const tslib_1 = require("tslib");
const ws_1 = require("ws");
const rxjs_1 = require("rxjs");
class SocketSwitch {
    constructor(wss) {
        this.wss = wss;
    }
    sendCleanToAll(eventType, data, responseTo) {
        const cleanData = plainObject(data);
        return this.sendToAll(eventType, cleanData, responseTo);
    }
    sendToAll(eventType, data, responseTo) {
        if (!this.wss.clients) {
            return;
        }
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
        // console.log('listening to messages on socket connection...')
        this.ws.on('message', (dataString) => this.onMessage(dataString));
        return this;
    }
    onMessage(dataString) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
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
        return this.ws.send(JSON.stringify(message));
    }
    sendClean(eventType, data, responseTo) {
        return this.send(eventType, plainObject(data), responseTo);
    }
}
exports.WsEventProcessor = WsEventProcessor;
function plainObject(Class, { seen = [] } = {}) {
    if (!(Class instanceof Object)) {
        return Class;
    }
    if (Class instanceof Array) {
        return Class.map(x => {
            // seen.push(x)
            return plainObject(x, { seen });
        });
    }
    const clone = Object.assign({}, Class);
    seen.push(Class);
    Object.entries(clone).forEach(([key, value]) => {
        // remove circular references
        if (seen.includes(value)) {
            delete clone[key];
            return;
        }
        clone[key] = plainObject(value, { seen });
    });
    return clone;
}
exports.plainObject = plainObject;
//# sourceMappingURL=WsEventProcessor.class.js.map