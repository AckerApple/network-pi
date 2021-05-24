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
        this.socketListen();
    }
    initSocket() {
        this.ws = new WebSocket(this.url);
    }
    disconnect() {
        this.disconnectAsked = true;
        this.ws.close();
        delete this.ws;
        clearInterval(this.reconnectTimer);
    }
    reconnect() {
        this.disconnect();
        this.connect();
    }
    sendWaitMessageResponse(message) {
        const id = Date.now() + '-' + this.loadCount;
        message.responseId = id;
        return new Promise((res, rej) => {
            const obj = { res, rej };
            this.promises[id] = obj; // prevent type checking `res`
            this.ws.send(JSON.stringify(message));
        });
    }
    socketListen() {
        const pins = {};
        // const pin0 = {num:0, type:'OUTPUT', mode:'low'}
        this.ws.onclose = () => {
            delete this.ws;
            if (!this.disconnectAsked) {
                console.log('Server closed unexpectedly. Attempting to reconnect');
                this.reconnectTimer = setInterval(() => {
                    this.$reconnecting.next();
                    this.connect();
                }, 5000);
                return;
            }
            delete this.disconnectAsked;
        };
        this.ws.onopen = () => {
            clearInterval(this.reconnectTimer);
            this.$onopen.next(this.ws);
        };
        this.ws.onmessage = ev => {
            const data = JSON.parse(ev.data);
            this.lastMessage = data;
            // someone waiting for a response?
            if (data.responseId && this.promises[data.responseId]) {
                const handler = this.promises[data.responseId];
                delete this.promises[data.responseId];
                return handler.res(data.data);
            }
            this.$onmessage.next(data);
        };
    }
    send(eventType, data) {
        this.ws.send(JSON.stringify({ eventType, data }));
    }
    sendWaitResponse(eventType, data) {
        const message = { eventType, data };
        return this.sendWaitMessageResponse(message);
    }
}
exports.WsEventCommunicator = WsEventCommunicator;
//# sourceMappingURL=WsEventCommunicator.class.js.map