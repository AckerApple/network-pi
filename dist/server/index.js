import * as path from "path";
import * as nconf from "nconf";
import { WsPinConnectionSwitch } from "./wss";
import { startHttpWebSocketServer } from './index.utils';
// configurations
nconf.argv().env(); // read params
const host = nconf.get('host') || undefined;
const port = nconf.get('port') || 3000;
const basePath = __dirname;
console.log('basePath', basePath);
const servers = startHttpWebSocketServer({
    port, host,
    httpStaticFilePath: path.join(__dirname, '../app/dist/network-pi-webapp')
});
servers.wss.on('connection', ws => {
    console.log('connection');
    new WsPinConnectionSwitch(ws);
});
servers.wss.on('open', (ws) => console.log('opened'));
//# sourceMappingURL=index.js.map