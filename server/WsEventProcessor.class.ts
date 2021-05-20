import * as WebSocket from "ws"
import { OPEN } from "ws"
import { WsMessage } from "../shared/types";
import { Subject } from "rxjs";

export class SocketSwitch {
  constructor(public wss: WebSocket.Server) {}

  sendToAll(eventType: string, data: any, responseTo?: WsMessage) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        new WsEventProcessor(client).send(eventType, data, responseTo)
      }
    })
  }
}

export class WsEventProcessor {
  $message: Subject<WsMessage> = new Subject()

  constructor(public ws: WebSocket) {
    ws.on('message', (dataString:string) => this.onMessage(dataString))
  }

  async onMessage(dataString: string) {
    try{
      const data: WsMessage = JSON.parse( dataString )
      this.$message.next(data)
    }catch(e){
      console.error(e)
      return
    }
  }

   send(eventType: string, data: any, responseTo?: WsMessage) {
    const message: WsMessage = {eventType, data}

    if (responseTo?.responseId) {
      message.responseId = responseTo.responseId
    }

    this.ws.send( JSON.stringify(message) )
  }
}
