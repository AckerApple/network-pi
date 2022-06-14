export * from "../shared/types" 
import * as path from "path"
import * as nconf from "nconf"
import { startHttpWebSocketServer } from './index.utils'
import { WsEventProcessor } from "../shared/WsEventProcessor.class";
import { WsPinConnectionSwitch } from "./WsPinConnectionSwitch.class";

// configurations
nconf.argv().env() // read params
const host = nconf.get('host') || undefined
const port = nconf.get('port') || 3000

export interface pin {
  number:number
}

export interface pins {
  [index:string]:pin
}

const basePath = __dirname

const servers = startHttpWebSocketServer({
  port, host,
  httpStaticFilePaths: [
    path.join(__dirname,'../app/dist/network-pi-webapp')
  ]
})

servers.wss.on('connection', ws => {
  console.log('ws connection')
  const messageHandler = new WsPinConnectionSwitch(ws)
  new WsEventProcessor(ws).monitorMessages().$message.subscribe(msg =>
    messageHandler.processWsEventMessage(msg)
  )
})

// servers.wss.on('open', (ws) => console.log('opened'))
