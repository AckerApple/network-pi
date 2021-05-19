"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const nconf = require("nconf");
const wss_1 = require("./wss");
const index_utils_1 = require("./index.utils");
// configurations
nconf.argv().env(); // read params
const host = nconf.get('host') || undefined;
const port = nconf.get('port') || 3000;
const basePath = __dirname;
console.log('basePath', basePath);
const servers = index_utils_1.startHttpWebSocketServer({
    port, host,
    httpStaticFilePath: path.join(__dirname, '../app/dist/network-pi-webapp')
});
servers.wss.on('connection', ws => {
    console.log('connection');
    new wss_1.WsPinConnectionSwitch(ws);
});
servers.wss.on('open', (ws) => console.log('opened'));
//# sourceMappingURL=index.js.map