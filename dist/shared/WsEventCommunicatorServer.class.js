"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsEventCommunicatorBrowser = void 0;
const tslib_1 = require("tslib");
const WsEventCommunicatorBase_class_1 = require("./WsEventCommunicatorBase.class");
const WS = require("ws");
class WsEventCommunicatorBrowser extends WsEventCommunicatorBase_class_1.WsEventCommunicatorBase {
    initSocket() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const ws = new WS(this.url);
                this.socketListen(ws);
            }
            catch (err) {
                console.error('failed to init socket', err);
            }
        });
    }
}
exports.WsEventCommunicatorBrowser = WsEventCommunicatorBrowser;
//# sourceMappingURL=WsEventCommunicatorServer.class.js.map