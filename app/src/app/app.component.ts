import { Component } from '@angular/core';

declare const ws: any

const hostPath = window.location.hostname + ':' + (3000 || window.location.port)
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  wsUrl = 'ws://' + hostPath +'/foo'

  loadCount = 0
  title = 'network-pi-webapp';
  pins: {[index: string]: any}

  terminalCommand: string
  commandResult: string

  wsMessage: any
  ws: WebSocket

  constructor() {
    console.log('starting')
  }

  connect() {
    this.initSocket()
    this.socketListen()
  }

  initSocket() {
    console.log('starting', this.wsUrl)
    this.ws = new WebSocket( this.wsUrl );
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

  socketListen() {
    const pins = {}
    const pin0 = {num:0, type:'OUTPUT', mode:'low'}

    this.ws.onopen = () => {
      console.log('websocket is connected ...')
      ++this.loadCount
      this.send('getPins')
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
          Object.assign(pins, data)
          this.pins = data.data // JSON.stringify(data, null, 2)
          break;

        default:
          this.wsMessage = data
      }

    }
  }

  submitPins(){
    console.log('sending')
    ++this.loadCount
    this.send('setPins', this.pins)
    return false
  }

  setPinsByString(pins: string) {
    const newPins = JSON.parse(pins)
    this.pins = newPins
  }

  sendTerminalCommand(command: string) {
    ++this.loadCount
    this.send('command', command)
  }
}
