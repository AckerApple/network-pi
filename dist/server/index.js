"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const nconf = require("nconf");
const index_utils_1 = require("./index.utils");
const WsEventProcessor_class_1 = require("../shared/WsEventProcessor.class");
const WsPinConnectionSwitch_class_1 = require("./WsPinConnectionSwitch.class");
// configurations
nconf.argv().env(); // read params
const host = nconf.get('host') || undefined;
const port = nconf.get('port') || 3000;
const basePath = __dirname;
const servers = index_utils_1.startHttpWebSocketServer({
    port, host,
    httpStaticFilePaths: [
        path.join(__dirname, '../app/dist/network-pi-webapp')
    ]
});
servers.wss.on('connection', ws => {
    console.log('ws connection');
    const messageHandler = new WsPinConnectionSwitch_class_1.WsPinConnectionSwitch(ws);
    new WsEventProcessor_class_1.WsEventProcessor(ws).monitorMessages().$message.subscribe(msg => messageHandler.processWsEventMessage(msg));
});
// servers.wss.on('open', (ws) => console.log('opened'))
//# sourceMappingURL=index.js.map