"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeHttpServerToWebSocket = exports.addWebSocketToHttpServer = exports.startHttpWebSocketServer = void 0;
const tslib_1 = require("tslib");
const nodeStatic = require('node-static');
const WebSocket = require("ws");
const http = require("http");
const url = require("url");
function startHttpWebSocketServer({ port = 3000, host = '0.0.0.0', httpStaticFilePaths, onRequest = () => undefined }) {
    console.log('serving static files from', httpStaticFilePaths);
    const server = http.createServer((req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        onRequest(req, res);
        const reqUrl = req.url;
        const rUrl = {
            path: reqUrl.split('?').shift(),
            query: url.parse(reqUrl, true).query
        };
        let result = { status: 404, headers: {} };
        for (const path of httpStaticFilePaths) {
            var file = new nodeStatic.Server(path); // default includes {cache:3600}
            result = yield new Promise((resolve, reject) => {
                try {
                    file.servePath(rUrl.path, 200, {}, req, res, (status, headers) => {
                        resolve({ status, headers });
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
            if (result.status < 400) {
                break;
            }
        }
        // should we cause 404?
        if (result.status < 300) {
            return; // request already closed
        }
        res.writeHead(result.status, result.headers);
        res.end();
    }));
    const wss = addWebSocketToHttpServer(server);
    server.listen(port, host, () => {
        console.log(`server started - ${host}:${port}`);
    });
    return { http: server, wss };
}
exports.startHttpWebSocketServer = startHttpWebSocketServer;
function addWebSocketToHttpServer(server) {
    // console.log('upgrading http server...')
    const wss = new WebSocket.Server({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
        // console.log('upgraded http server')
        upgradeHttpServerToWebSocket(request, socket, head, wss);
    });
    return wss;
}
exports.addWebSocketToHttpServer = addWebSocketToHttpServer;
function upgradeHttpServerToWebSocket(request, socket, head, wss) {
    // console.log('starting websocket server...')
    const pathname = url.parse(request.url).pathname;
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            // console.log('ws connection created on path /ws')
            wss.emit('connection', ws, request);
        });
    }
    else {
        socket.destroy();
    }
}
exports.upgradeHttpServerToWebSocket = upgradeHttpServerToWebSocket;
//# sourceMappingURL=index.utils.js.map