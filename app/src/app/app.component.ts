import { eventTypes, PinState, ServerPinsSummary, WsMessage } from "../../../shared/types";
import { Component } from '@angular/core';

declare const ws: any

const urlParams = new URLSearchParams(window.location.search)
const forcePort = urlParams.get('port')
const forceHost = urlParams.get('host')
const port = window.location.port || forcePort || 3000
const hostPath = window.location.hostname + ':' + port
const wsUrl = 'ws://' + hostPath +'/ws'

interface PinConfig {
  num  : 0,
  state: PinState,
  request: PinState
  blink: number
}

interface Config {
  wsUrl: string
  debug?: boolean
  pins: {
    [index: number]: PinConfig
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  strobePins: number

  config: Config = this.loadLocalStorage() || {
    wsUrl, pins: {}
  }

  loadCount = 0
  title = 'network-pi-webapp';

  terminalCommand: string
  commandResult: string

  wsMessage: WsMessage
  ws: WebSocket
  disconnectAsked: boolean
  reconnectTimer: number

  promises: {
    [id: string]: {res: (data: WsMessage) => any, rej: () => any}
  } = {}

  constructor() {
    console.log('starting')

    if (forceHost || forcePort) {
      this.config.wsUrl = wsUrl
    }

    this.config.pins = this.config.pins || {}
    this.connect()
  }

  connect() {
    console.log('making ws connection...')
    if (this.ws) {
      console.warn('web socket server already connected')
      return
    }

    this.initSocket()
    this.socketListen()
    this.saveConfig()
  }

  initSocket() {
    this.ws = new WebSocket( this.config.wsUrl )
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

  send(eventType: eventTypes, data?: any) {
    this.ws.send(JSON.stringify({eventType, data}))
  }

  reloadPins() {
    ++this.loadCount
    this.sendWaitResponse<ServerPinsSummary>('getPins')
      .then(data => {
        --this.loadCount
        this.setPinsByResponse(data)
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
      this.reloadPins()
      /*
        ws.send(JSON.stringify(pin0))
        setInterval(function(){
        pin0.mode = pin0.mode==='low' ? 'high' : 'low'
        ws.send(JSON.stringify(pin0))
        }, 1000)
      */
    }

    this.ws.onmessage = ev => {
      const data = JSON.parse(ev.data)
      this.wsMessage = data
      this.handleWsMessage(data)
    }
  }

  handleWsMessage(data: WsMessage) {
    // someone waiting for a response?
    if(data.responseId && this.promises[data.responseId]) {
      const handler = this.promises[data.responseId]
      delete this.promises[data.responseId]
      return handler.res(data.data)
    }

    switch (data.eventType) {
      case 'log':
        this.wsMessage = data.data
        break

      case 'command-result':
        --this.loadCount
        this.commandResult = data.data
        break

      case 'pins':
        --this.loadCount
        this.setPinsByResponse(data.data)
        // this.pins = data.data // JSON.stringify(data, null, 2)
        break;

      default:
        this.wsMessage = data
    }
  }

  setPinsByResponse(data: ServerPinsSummary) {
    Object.keys(data).forEach(key => {
      this.config.pins[key] = this.config.pins[key] || {
        num: key, request: {}, state: {}
      }

      Object.assign(this.config.pins[key].state, data[key])
    })
  }

  submitPins(){
    ++this.loadCount
    const pins: ServerPinsSummary = {}

    Object.keys(this.config.pins).forEach(key => {
      pins[key] = {
        num: key, ...this.config.pins[key].request
      }
    })

    this.send('setPins', pins)
    return false
  }

  sendWaitResponse<T>(eventType: eventTypes, data?: any): Promise<T>{
    const message = {eventType, data}
    return this.sendWaitMessageResponse<T>(message)
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

  saveConfig() {
    localStorage.setItem('networkPi', JSON.stringify(this.config))
    // console.log('saved localStorage', localStorage.networkPi, localStorage)
  }

  loadLocalStorage() {
    try {
      const localValues = localStorage.networkPi
      const config: Config = JSON.parse(localValues) || this.config

      console.log('previous localStorage loaded', config)

      Object.keys(config.pins).forEach(pinId => {
        const pin: PinConfig = config.pins[pinId]
        pin.request = pin.request || {type: 'INPUT'}
        pin.state = pin.state || {type: 'INPUT'}
      });

      return this.config = config
    } catch (err) {
      console.error('unable to load past settings', err)
    }
  }

  setPinsByString(pins: string) {
    const newPins = JSON.parse(pins)
    this.config.pins = newPins
    this.saveConfig()
  }

  blinkPin(pin: PinConfig) {
    if (pin.blink) {
      clearInterval(pin.blink)
      pin.request.mode = 'LOW'
      delete pin.blink
      this.submitPins()
      return
    }

    pin.blink = setInterval(() => {
      this.togglePin(pin)
    }, 500)
  }

  sendTerminalCommand(command: string) {
    ++this.loadCount
    this.send('command', command)
  }

  pinHigh(pin: PinConfig) {
    pin.request.mode = "HIGH"
    this.submitPins()
  }

  pinLow(pin: PinConfig) {
    pin.request.mode = "LOW"
    this.submitPins()
  }

  togglePin(pin: PinConfig) {
    const orgMode = pin.request.mode === 'HIGH' ? 'HIGH' : 'LOW'
    const newMode = orgMode === 'HIGH' ? 'LOW' : 'HIGH'

    pin.request.mode = newMode
    this.submitPins()
  }

  shortPressPin(pin: PinConfig) {
    this.togglePin(pin)

    setTimeout(() => {
      this.togglePin(pin)
    }, 250)
  }

  toggleStrobePins() {
    if (this.strobePins) {
      clearInterval(this.strobePins)
      delete this.strobePins
      return
    }

    this.strobePinsAction()
  }

  strobePinsAction() {
    const pinKeys = Object.keys(this.config.pins)
    const pinCount = pinKeys.length
    let direction = 1

    this.strobePins = setInterval(() => {
      const orderedKeys = pinKeys.sort((a,b)=>Number(direction ? a : b)-Number(direction ? b : a))
      orderedKeys.forEach((key,i) => {
        setTimeout(() => {
          this.togglePin(this.config.pins[key])
          setTimeout(() => {
            this.togglePin(this.config.pins[key])
          }, 100)
        }, i * 100)
      });

      direction = direction ? 0 : 1
    }, pinCount * 200)
  }

  addPin() {
    let index = -1
    console.log(Object.keys(this.config.pins))
    while(++index < 40) {
      const pinIndex = index.toString()
      const found = Object.keys(this.config.pins).includes(pinIndex)
      if (found) {
        continue
      }

      this.config.pins[pinIndex] = {
        num  : pinIndex,
        type : "INPUT",
        mode : "LOW"
      }

      break
    }

    this.saveConfig()
  }

  deletePin(pin: {value: {num: string}, details: string}) {
    const pinNum = pin.value.num.toString()
    console.log('send to remove pin', pinNum)
    delete this.config.pins[pinNum]
    this.submitPins()
  }
}
