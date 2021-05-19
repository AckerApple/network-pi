import { eventTypes, PinState, ServerPinsSummary, WsMessage } from "../../../shared/types";
import { WsEventCommunicator } from "../../../shared/WsEventCommunicator.class";
import { Component } from '@angular/core';
import { Subscription } from "rxjs";

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
  subs = new Subscription()
  strobePins: number

  config: Config = this.loadLocalStorage() || {
    wsUrl, pins: {}
  }

  wsComm: WsEventCommunicator = new WsEventCommunicator(this.config.wsUrl)

  loadCount = 0
  title = 'network-pi-webapp';

  terminalCommand: string
  commandResultData: string

  constructor() {
    console.log('starting')

    if (forceHost || forcePort) {
      this.config.wsUrl = wsUrl
    }

    this.subs.add(
      this.wsComm.$onopen.subscribe(() => this.reloadPins())
    ).add(
      this.wsComm.$onmessage.subscribe(data => this.handleWsMessage(data))
    )

    this.config.pins = this.config.pins || {}
    this.wsComm.connect()
  }

  updateWsUrl(url: string) {
    this.wsComm.url = url
    this.config.wsUrl = url
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

  reloadPins() {
    ++this.loadCount
    this.sendWaitResponse<ServerPinsSummary>('getPins')
      .then(data => {
        --this.loadCount
        this.setPinsByResponse(data)
      })
  }

  handleWsMessage(data: WsMessage) {
    if(!this[data.eventType]) {
      console.warn(`unknown ws message of type ${data.eventType}`)
      return data
    }

    this[data.eventType].call(this, data.data)
  }

  commandResult(data: any) {
    --this.loadCount
    this.commandResultData = data
  }

  pins(data: any) {
    --this.loadCount
    this.setPinsByResponse(data)
  }

  setPinsByResponse(data: ServerPinsSummary) {
    console.log('data', data)
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
    return this.wsComm.sendWaitResponse(eventType, data)
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
        mode : "LOW",
        request: {},
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

  send(eventType: eventTypes, data?: any) {
    this.wsComm.send(eventType, data)
  }
}