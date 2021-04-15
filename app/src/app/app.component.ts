import { Component } from '@angular/core';

declare const ws: any

const urlParams = new URLSearchParams(window.location.search)
const forcePort = urlParams.get('port')
const forceHost = urlParams.get('host')
const port = window.location.port || forcePort || 3000
const hostPath = window.location.hostname + ':' + port
const wsUrl = 'ws://' + hostPath +'/foo'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  strobePins: number

  config: {
    debug: boolean
    wsUrl: string
    pins: {
      [index: number]: {
        num  : 0,
        type : "INPUT" | "OUTPUT"
        mode : "HIGH" | "LOW"
      }
    }
  } = this.loadLocalStorage() || {
    wsUrl, pins: {}
  }

  loadCount = 0
  title = 'network-pi-webapp';

  terminalCommand: string
  commandResult: string

  wsMessage: any
  ws: WebSocket

  constructor() {
    console.log('starting')

    if (forceHost || forcePort) {
      this.config.wsUrl = wsUrl
    }

    this.config.pins = this.config.pins || {}
    this.connect()
  }

  connect() {
    this.initSocket()
    this.socketListen()
    this.saveConfig()
  }

  initSocket() {
    console.log('starting', this.config.wsUrl)
    this.ws = new WebSocket( this.config.wsUrl );
  }

  disconnect() {
    this.ws.close()
    delete this.ws
  }

  send(eventType:string, data?: any) {
    this.ws.send(JSON.stringify({
      eventType, data
    }))
  }

  reloadPins() {
    ++this.loadCount
    this.send('getPins')
  }

  socketListen() {
    const pins = {}
    // const pin0 = {num:0, type:'OUTPUT', mode:'low'}

    this.ws.onopen = () => {
      console.log('websocket is connected ...')
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
          Object.keys(data.data).forEach(key => {
            this.config.pins[key] = this.config.pins[key] || {}
            Object.assign(this.config.pins[key], data.data[key])
          });
          // this.pins = data.data // JSON.stringify(data, null, 2)
          break;

        default:
          this.wsMessage = data
      }
    }
  }

  submitPins(){
    ++this.loadCount
    this.send('setPins', this.config.pins)
    return false
  }

  saveConfig() {
    localStorage.networkPi = JSON.stringify(this.config)
  }

  loadLocalStorage() {
    try {
      const localValues = localStorage.networkPi
      return this.config = JSON.parse(localValues) || this.config
    } catch (err) {
      console.error('unable to load past settings', err)
    }
  }

  setPinsByString(pins: string) {
    const newPins = JSON.parse(pins)
    this.config.pins = newPins
  }

  blinkPin(pin: any) {
    if (pin.blink) {
      clearInterval(pin.blink)
      pin.mode = 'LOW'
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

  pinHigh(pin: any) {
    pin.mode = "HIGH"
    this.submitPins()
  }

  pinLow(pin: any) {
    pin.mode = "LOW"
    this.submitPins()
  }

  togglePin(pin: any) {
    const orgMode = pin.mode === 'HIGH' ? 'HIGH' : 'LOW'
    const newMode = orgMode === 'HIGH' ? 'LOW' : 'HIGH'

    pin.mode = newMode
    this.submitPins()
  }

  shortPressPin(pin: any) {
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

    this.strobePins = setInterval(() => {
      pinKeys.forEach((key,i) => {
        setTimeout(() => {
          this.togglePin(this.config.pins[key])
        }, i * 500)
      });

    }, pinCount * 500)
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

  deletePin(pin: {num: string, details: string}) {
    const pinNum = pin.num.toString()
    console.log('send to remove pin', pinNum)
    delete this.config.pins[pinNum]
    this.submitPins()
  }
}
