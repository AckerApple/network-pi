import { WsMessage } from "./types";
import { Subject } from "rxjs";

export class WsEventCommunicator {
  reconnectTimer: number
  disconnectAsked!: boolean
  lastMessage!: WsMessage

  loadCount = 0
  ws!: WebSocket

  promises: {
    [id: string]: {res: (data: WsMessage) => any, rej: () => any}
  } = {}

  $onopen: Subject<WebSocket> = new Subject()
  $onmessage: Subject<WsMessage> = new Subject()

  constructor(public url?: string) {}

  connect() {
    console.log('making ws connection...')
    if (this.ws) {
      console.warn('web socket server already connected')
      return
    }

    delete this.disconnectAsked

    this.initSocket()
    this.socketListen()
  }

  initSocket() {
    this.ws = new WebSocket( this.url )
  }

  disconnect() {
    this.disconnectAsked = true
    this.ws.close()
    delete this.ws
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

  socketListen() {
    const pins = {}
    // const pin0 = {num:0, type:'OUTPUT', mode:'low'}

    this.ws.onclose = () => {
      delete this.ws

      if (!this.disconnectAsked) {
        console.log('Server closed unexpectedly. Attempting to reconnect')
        this.reconnectTimer = setInterval(() => {
          console.log('attempting reconnect')
          this.connect()
        }, 5000)
        return
      }

      delete this.disconnectAsked
    }

    this.ws.onopen = () => {
      clearInterval(this.reconnectTimer)
      console.log('websocket is connected')
      this.$onopen.next(this.ws)
    }

    this.ws.onmessage = ev => {
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