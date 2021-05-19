import { __awaiter } from "tslib";
const nodeStatic = require('node-static');
import * as WebSocket from "ws";
import * as http from "http";
import * as url from "url";
import { Subject } from "rxjs";
export function startHttpWebSocketServer({ port = 3000, host = '0.0.0.0', httpStaticFilePath }) {
    console.log('serving static files from', httpStaticFilePath);
    var file = new (nodeStatic.Server)(httpStaticFilePath);
    const server = http.createServer((req, res) => {
        console.log('request', req.url);
        const rUrl = {
            path: req.url.split('?').shift(),
            query: url.parse(req.url, true).query
        };
        file.serve(req, res);
    });
    const wss = addWebSocketToHttpServer(server);
    server.listen(port, host, () => {
        console.log(`server started - ${host}:${port}`);
    });
    return { http: server, wss };
}
export function addWebSocketToHttpServer(server) {
    console.log('upgrading http server...');
    const wss = new WebSocket.Server({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
        console.log('upgrading http server');
        upgradeHttpServerToWebSocket(request, socket, head, wss);
    });
    return wss;
}
export function upgradeHttpServerToWebSocket(request, socket, head, wss) {
    console.log('starting websocket server...');
    const pathname = url.parse(request.url).pathname;
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            console.log('ws connection created on path /ws');
            wss.emit('connection', ws, request);
        });
    }
    else {
        socket.destroy();
    }
}
export class ConnectionSwitch {
    constructor(ws) {
        this.ws = ws;
        this.$message = new Subject();
        console.log('connected');
        ws.on('message', (dataString) => this.onMessage(dataString));
    }
    onMessage(dataString) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.parse(dataString);
                this.$message.next(data);
                this.processEvent(data.eventType, data);
            }
            catch (e) {
                console.error(e);
                return;
            }
        });
    }
    processEvent(eventType, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this[data.eventType]) {
                const message = `received unknown command ${data.eventType}`;
                console.warn('unknown', message);
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
    send(eventType, data, responseTo) {
        const message = { eventType, data };
        if (responseTo === null || responseTo === void 0 ? void 0 : responseTo.responseId) {
            message.responseId = responseTo.responseId;
        }
        this.ws.send(JSON.stringify(message));
    }
}
//# sourceMappingURL=index.utils.js.map