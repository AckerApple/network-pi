"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeHttpServerToWebSocket = exports.addWebSocketToHttpServer = exports.startHttpWebSocketServer = void 0;
const nodeStatic = require('node-static');
const WebSocket = require("ws");
const http = require("http");
const url = require("url");
function startHttpWebSocketServer({ port = 3000, host = '0.0.0.0', httpStaticFilePath }) {
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