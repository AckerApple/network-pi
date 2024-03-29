"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventCommunicatorBase = void 0;
const tslib_1 = require("tslib");
const rxjs_1 = require("rxjs");
class WsEventCommunicatorBase {
    constructor(url) {
        this.url = url;
        this.loadCount = 0;
        this.promises = {};
        this.$onopen = new rxjs_1.Subject();
        this.$error = new rxjs_1.Subject();
        this.$onmessage = new rxjs_1.Subject();
        this.$reconnecting = new rxjs_1.Subject();
    }
    connect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.ws) {
                console.warn('web socket server already connected');
                return;
            }
            delete this.disconnectAsked;
            return this.initSocket();
        });
    }
    initSocket() {
        throw 'initSocket must be overwritten by an extending class';
    }
    disconnect() {
        this.disconnectAsked = true;
        if (this.ws) {
            this.ws.close();
            delete this.ws;
        }
        clearInterval(this.reconnectTimer);
        delete this.reconnectTimer;
    }
    reconnect() {
        this.disconnect();
        this.connect();
    }
    sendWaitMessageResponse(message) {
        const ws = this.ws;
        const id = Date.now() + '-' + (++this.loadCount);
        message.responseId = id;
        return new Promise((res, rej) => {
            const obj = { res, rej };
            this.promises[id] = obj; // prevent type checking `res`
            ws.send(JSON.stringify(message));
        });
    }
    keepRetryingConnect() {
        // console.log(`Trying ws connection to ${this.url}...`)
        this.reconnectTimer = setInterval(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.$reconnecting.next();
            try {
                // console.log('running connect loop')
                yield this.connect()
                    .catch((err) => console.warn(`Failed connection try to ${this.url}`, err));
                // console.log('sent connect loop')
            }
            catch (err) {
                console.warn(`Failed trying connection to ${this.url}`, err);
            }
        }), 5000);
    }
    socketListen(ws) {
        const pins = {};
        // const pin0 = {num:0, type:'OUTPUT', mode:'low'}
        ws.onerror = (event) => {
            this.$error.next(event.error);
        };
        ws.onclose = () => {
            delete this.ws;
            if (!this.reconnectTimer && !this.disconnectAsked) {
                this.keepRetryingConnect();
                return;
            }
            delete this.disconnectAsked;
        };
        ws.onopen = () => {
            clearInterval(this.reconnectTimer);
            delete this.reconnectTimer;
            this.ws = ws; // only when connected successfully do we set
            this.$onopen.next(this.ws);
        };
        ws.onmessage = ev => {
            const data = JSON.parse(ev.data.toString());
            this.lastMessage = data;
            // someone waiting for a response?
            const resId = data.responseId;
            if (resId && this.promises[resId]) {
                const handler = this.promises[resId];
                delete this.promises[resId];
                --this.loadCount;
                return handler.res(data.data);
            }
            this.$onmessage.next(data);
        };
    }
    send(eventType, data) {
        const ws = this.ws;
        ws.send(JSON.stringify({ eventType, data }));
    }
    trySend(eventType, data) {
        if (!this.ws) {
            return false;
        }
        this.send(eventType, data);
        return true;
    }
    sendWaitResponse(eventType, data) {
        const message = { eventType, data };
        return this.sendWaitMessageResponse(message);
    }
}
exports.WsEventCommunicatorBase = WsEventCommunicatorBase;
//# sourceMappingURL=WsEventCommunicatorBase.class.js.map