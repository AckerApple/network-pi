import { WsMessage } from './types'
import { Subject } from 'rxjs'
// const WebSocket = require('ws')

const isWsNeeded = typeof WebSocket === 'undefined'
async function getWs(): Promise<any> {
  if (isWsNeeded) {
    const ws = await import('ws')
    return ws as any
  }

  return WebSocket as any
}

export class WsEventCommunicator {
  reconnectTimer: any
  disconnectAsked?: boolean
  lastMessage!: WsMessage

  loadCount = 0
  ws?: WebSocket

  promises: {
    [id: string]: {res: (data: WsMessage) => any, rej: () => any}
  } = {}

  $onopen: Subject<WebSocket> = new Subject()
  $error: Subject<WebSocket> = new Subject()
  $onmessage: Subject<WsMessage> = new Subject()
  $reconnecting: Subject<void> = new Subject()

  constructor(public url?: string) {}

  async connect() {
    if (this.ws) {
      console.warn('web socket server already connected')
      return
    }

    delete this.disconnectAsked

    return this.initSocket()
  }

  async initSocket() {
    try {
      const ws = new (await getWs())(this.url)
      this.socketListen(ws)
    } catch (err) {
      console.error('failed to init socket', err);
    }
  }

  disconnect() {
    this.disconnectAsked = true
    if (this.ws) {
      this.ws.close()
      delete this.ws
    }
    clearInterval(this.reconnectTimer)
    delete this.reconnectTimer
  }

  reconnect() {
    this.disconnect()
    this.connect()
  }

  sendWaitMessageResponse<T>(message: WsMessage): Promise<T>{
    const ws = this.ws as WebSocket

    const id = Date.now() + '-' + (++this.loadCount)
    message.responseId = id
    return new Promise((res, rej) =>{
      const obj = {res, rej}
      this.promises[id] = obj as any // prevent type checking `res`
      ws.send(JSON.stringify(message))
    })
  }

  keepRetryingConnect() {
    // console.log(`Trying ws connection to ${this.url}...`)

    this.reconnectTimer = setInterval(async () => {
      this.$reconnecting.next()
      try {
        // console.log('running connect loop')
        await this.connect()
          .catch((err: Error) =>
            console.warn(`Failed connection try to ${this.url}`, err)
          )
        // console.log('sent connect loop')
      } catch (err) {
        console.warn(`Failed trying connection to ${this.url}`, err)
      }
    }, 5000)
  }

  socketListen(ws: WebSocket) {
    const pins = {}
    // const pin0 = {num:0, type:'OUTPUT', mode:'low'}
    ws.onerror = (event) => {
      this.$error.next((event as any).error)
    }

    ws.onclose = () => {
      delete this.ws

      if (!this.reconnectTimer && !this.disconnectAsked) {
        this.keepRetryingConnect()
        return
      }

      delete this.disconnectAsked
    }

    ws.onopen = () => {
      clearInterval(this.reconnectTimer)
      delete this.reconnectTimer
      this.ws = ws // only when connected successfully do we set
      this.$onopen.next(this.ws)
    }

    ws.onmessage = ev => {
      const data = JSON.parse(ev.data.toString())
      this.lastMessage = data

      // someone waiting for a response?
      const resId = data.responseId
      if(resId && this.promises[resId]) {
        const handler = this.promises[resId]
        delete this.promises[resId]
        --this.loadCount
        return handler.res(data.data)
      }

      this.$onmessage.next(data)
    }
  }

  send(eventType: string, data?: any) {
    const ws = this.ws as WebSocket
    ws.send(JSON.stringify({eventType, data}))
  }

  trySend(eventType: string, data?: any) {
    if (!this.ws) {
      return false
    }

    this.send(eventType, data)

    return true
  }

  sendWaitResponse<T>(eventType: string, data?: any): Promise<T>{
    const message = {eventType, data}
    return this.sendWaitMessageResponse<T>(message)
  }
}
