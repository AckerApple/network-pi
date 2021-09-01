import * as WebSocket from "ws"
import { OPEN } from "ws"
import { WsMessage } from "../shared/types";
import { Subject } from "rxjs";

export class SocketSwitch {
  constructor(public wss: WebSocket.Server) {}

  sendCleanToAll(eventType: string, data: any, responseTo?: WsMessage) {
    const cleanData = plainObject(data)
    return this.sendToAll(eventType, cleanData, responseTo)
  }

  sendToAll(eventType: string, data: any, responseTo?: WsMessage) {
    if (!this.wss.clients) {
      return
    }

    this.wss.clients.forEach((client) => {
      if (client.readyState === OPEN) {
        new WsEventProcessor(client).send(eventType, data, responseTo)
      }
    })
  }
}

export class WsEventProcessor {
  $message: Subject<WsMessage> = new Subject()

  constructor(public ws: WebSocket) {}

  monitorMessages() {
    // console.log('listening to messages on socket connection...')
    this.ws.on('message', (dataString:string) => this.onMessage(dataString))
    return this
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

    return this.ws.send( JSON.stringify(message) )
  }

  sendClean(
    eventType: string, data: any, responseTo?: WsMessage
  ) {
    return this.send(eventType, plainObject(data), responseTo)
  }
}


export function plainObject<T>(
  Class: T, {seen = []}: {seen?: any[]} = {}
): T {
  if (!(Class instanceof Object)) {
    return Class
  }

  if (Class instanceof Array) {
    return Class.map(x => {
      // seen.push(x)
      return plainObject(x, {seen})
    }) as any
  }

  const clone: any = {...Class}
  seen.push(Class)
  Object.entries(clone).forEach(([key, value]) => {
    // remove circular references
    if (seen.includes(value)) {
      delete clone[key]
      return
    }

    clone[key] = plainObject(value, {seen})
  })

  return clone
}