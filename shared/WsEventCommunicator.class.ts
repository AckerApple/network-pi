import { WsMessage } from "./types";
import { Subject } from "rxjs";

export class WsEventCommunicator {
  reconnectTimer: any
  disconnectAsked!: boolean
  lastMessage!: WsMessage

  loadCount = 0
  ws!: WebSocket

  promises: {
    [id: string]: {res: (data: WsMessage) => any, rej: () => any}
  } = {}

  $onopen: Subject<WebSocket> = new Subject()
  $onmessage: Subject<WsMessage> = new Subject()
  $reconnecting: Subject<void> = new Subject()

  constructor(public url?: string) {}

  connect() {
    if (this.ws) {
      console.warn('web socket server already connected')
      return
    }

    delete this.disconnectAsked

    this.initSocket()
  }

  initSocket() {
    const ws = new WebSocket( this.url )
    this.socketListen(ws)
  }

  disconnect() {
    this.disconnectAsked = true
    if (this.ws) {
      this.ws.close()
      delete this.ws
    }
    clearInterval(this.reconnectTimer)
  }

  reconnect() {
    this.disconnect()
    this.connect()
  }

  sendWaitMessageResponse<T>(message: WsMessage): Promise<T>{
    const id = Date.now() + '-' + this.loadCount
    message.responseId = id
    return new Promise((res, rej) =>{
      const obj = {res, rej}
      this.promises[id] = obj as any // prevent type checking `res`
      this.ws.send(JSON.stringify(message))
    })
  }

  socketListen(ws: WebSocket) {
    const pins = {}
    // const pin0 = {num:0, type:'OUTPUT', mode:'low'}

    ws.onclose = () => {
      delete this.ws

      if (!this.reconnectTimer && !this.disconnectAsked) {
        console.log('Server closed unexpectedly. Attempting to reconnect')
        this.reconnectTimer = setInterval(() => {
          this.$reconnecting.next()
          this.connect()
        }, 5000)
        return
      }

      delete this.disconnectAsked
    }

    ws.onopen = () => {
      clearInterval(this.reconnectTimer)
      this.ws = ws // only when connected successfully do we set
      this.$onopen.next(this.ws)
    }

    ws.onmessage = ev => {
      const data = JSON.parse(ev.data)
      this.lastMessage = data

      // someone waiting for a response?
      if(data.responseId && this.promises[data.responseId]) {
        const handler = this.promises[data.responseId]
        delete this.promises[data.responseId]
        return handler.res(data.data)
      }

      this.$onmessage.next(data)
    }
  }

  send(eventType: string, data?: any) {
    this.ws.send(JSON.stringify({eventType, data}))
  }

  sendWaitResponse<T>(eventType: string, data?: any): Promise<T>{
    const message = {eventType, data}
    return this.sendWaitMessageResponse<T>(message)
  }
}
