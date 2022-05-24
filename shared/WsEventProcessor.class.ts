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

/** Remove circular references from an object. Make an object safe to output anywhere
 * - Future update could add option.maxDepth which would prevent logging an Error too deeply nested
*/
export function plainObject<T>(
  Class: T, // An object to clean circular references from
  {seen = [], maxDepth}: {
      seen?: any[], // record of all objects seen (used to identify circular references)
      maxDepth?: number // optional ability to prevent returning an object too deeply nested
  } = {} 
): T {
  // not an array or not an object then we have no work to do
  if (!(Class instanceof Object)) {
    return Class
  }

  // We are working with an Object so begin controlling nested depth
  const newMaxDepth = maxDepth === undefined ? undefined : maxDepth - 1
  if (newMaxDepth !== undefined && newMaxDepth === -1) {
    return undefined as any // do not log nested any further 
  }

  if (Class instanceof Array) {
    // clone and clean all array positions
    return Class.map((x) => {
      return plainObject(x, {seen, maxDepth: newMaxDepth}) // self calling for next depth cleaned
    }) as any
  }

  const clone: any = {} // do not touch original object, create memory to clone it
  seen.push(Class) // record what we have cleaned to avoid circular references
  
  // loop object to clean children
  Object.getOwnPropertyNames(Class).forEach((key: string) => {
    const value = (Class as any)[key]

    // do we have a circular reference to something we've already seen?
    if (seen.includes(value)) {
        delete clone[ key ] // current item is a circular reference (remove it, it is seen elsewhere)
        return // do not continue
    }

    // clean children with a self call
    clone[key] = plainObject(value, {seen, maxDepth: newMaxDepth})
  })

  return clone // all clean and ready for use with things like JSON.stringify()
}
