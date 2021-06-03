"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventCommunicator = void 0;
const rxjs_1 = require("rxjs");
class WsEventCommunicator {
    constructor(url) {
        this.url = url;
        this.loadCount = 0;
        this.promises = {};
        this.$onopen = new rxjs_1.Subject();
        this.$onmessage = new rxjs_1.Subject();
        this.$reconnecting = new rxjs_1.Subject();
    }
    connect() {
        if (this.ws) {
            console.warn('web socket server already connected');
            return;
        }
        delete this.disconnectAsked;
        this.initSocket();
    }
    initSocket() {
        const ws = new WebSocket(this.url);
        this.socketListen(ws);
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
        const id = Date.now() + '-' + (++this.loadCount);
        message.responseId = id;
        return new Promise((res, rej) => {
            const obj = { res, rej };
            this.promises[id] = obj; // prevent type checking `res`
            this.ws.send(JSON.stringify(message));
        });
    }
    socketListen(ws) {
        const pins = {};
        // const pin0 = {num:0, type:'OUTPUT', mode:'low'}
        ws.onclose = () => {
            delete this.ws;
            if (!this.reconnectTimer && !this.disconnectAsked) {
                console.log('Server closed unexpectedly. Attempting to reconnect');
                this.reconnectTimer = setInterval(() => {
                    this.$reconnecting.next();
                    this.connect();
                }, 5000);
                return;
            }
            delete this.disconnectAsked;
        };
        ws.onopen = () => {
            clearInterval(this.reconnectTimer);
            this.ws = ws; // only when connected successfully do we set
            this.$onopen.next(this.ws);
        };
        ws.onmessage = ev => {
            const data = JSON.parse(ev.data);
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
        this.ws.send(JSON.stringify({ eventType, data }));
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
exports.WsEventCommunicator = WsEventCommunicator;
//# sourceMappingURL=WsEventCommunicator.class.js.map