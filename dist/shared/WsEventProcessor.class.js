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
/** Remove circular references from an object. Make an object safe to output anywhere
 * - Future update could add option.maxDepth which would prevent logging an Error too deeply nested
*/
function plainObject(Class, // An object to clean circular references from
{ seen = [], maxDepth } = {}) {
    // not an array or not an object then we have no work to do
    if (!(Class instanceof Object)) {
        return Class;
    }
    // We are working with an Object so begin controlling nested depth
    const newMaxDepth = maxDepth === undefined ? undefined : maxDepth - 1;
    if (newMaxDepth !== undefined && newMaxDepth === -1) {
        return undefined; // do not log nested any further 
    }
    if (Class instanceof Array) {
        // clone and clean all array positions
        return Class.map((x) => {
            return plainObject(x, { seen, maxDepth: newMaxDepth }); // self calling for next depth cleaned
        });
    }
    const clone = {}; // do not touch original object, create memory to clone it
    seen.push(Class); // record what we have cleaned to avoid circular references
    // loop object to clean children
    Object.getOwnPropertyNames(Class).forEach((key) => {
        const value = Class[key];
        // do we have a circular reference to something we've already seen?
        if (seen.includes(value)) {
            delete clone[key]; // current item is a circular reference (remove it, it is seen elsewhere)
            return; // do not continue
        }
        // clean children with a self call
        clone[key] = plainObject(value, { seen, maxDepth: newMaxDepth });
    });
    return clone; // all clean and ready for use with things like JSON.stringify()
}
exports.plainObject = plainObject;
//# sourceMappingURL=WsEventProcessor.class.js.map