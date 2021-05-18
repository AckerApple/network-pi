import * as WebSocket from "ws"
import * as os from "os"
import { pin, pi, InputPin, OutputPin } from "ack-pi"
import { eventTypes, pinClasses, ServerPinsSummary, WsMessage } from "../shared/types";
const { exec } = require("child_process");

export const wss = new WebSocket.Server({noServer: true})

const isPiPlatform = os.platform()==="linux"
const piPins = pi( isPiPlatform )
const pins: ServerPinsSummary = {
  "0":{
    "num"  : 0,
    "type" : "INPUT", // OUTPUT
    // "mode" : "LOW"
  },
  "1":{
    "num"  : 1,
    "type" : "INPUT",
    // "mode" : "low"
  }
}
const pinClasses:pinClasses = {}

export class ConnectionSwitch {
  constructor(public ws: WebSocket.connection) {
    console.log('connected')
    ws.on('message', (dataString:string) => this.onMessage(dataString))
  }

  async onMessage(dataString: string) {
    try{
      const data: WsMessage = JSON.parse( dataString )
      this.processEvent(data.eventType, data)
    }catch(e){
      console.error(e)
      return
    }
  }

  async processEvent(
    eventType: string, data: WsMessage
  ): Promise<void> {
    switch (data.eventType) {
      case 'setPins':
        // console.log('dataString', typeof dataString, typeof data, typeof data.data, data)
        setPins( data.data );
        this.send('pins', pins, data) // echo
        break;

      case 'getPins': 'pins'
        this.send('pins', pins, data)
        break;

      case 'command':
        this.send('command-result', await runCommand(data.data), data)
        break;

      default:
        this.send('log', {
          message: `received unknown command ${data.eventType}`, data
        }, data)
     }
   }

   send(eventType: eventTypes, data: any, responseTo?: WsMessage) {
    const message: WsMessage = {eventType, data}

    if (responseTo?.responseId) {
      message.responseId = responseTo.responseId
    }

    this.ws.send( JSON.stringify(message))
  }
}

export class WssSwitch {
  constructor(public wss: WebSocket.Server) {
    wss.on('connection', ws => this.onConnect(ws))
    wss.on('open', (ws) => console.log('opened'))
  }

  async onConnect(ws: WebSocket.connection) {
    return this.getNewConnectionSwitch(ws)
  }

  getNewConnectionSwitch(ws: WebSocket.connection) {
    return new ConnectionSwitch(ws)
  }
}

/** browser debug any sent command */
function runCommand(command: string) {
  return new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res(error)
      }
      if (stderr) {
          return res(stderr)
      }

      res(stdout)
    });
  })
}

function setPins( data: ServerPinsSummary ){
  // console.log('data', typeof data, data)
  for(let x in data){
    data[x].num = Number( <any>x )
    // data[x].num = x as any
    setPin( data[x] )
  }

  Object.keys(pins).filter(pin => !data[pin]).forEach(pin => {
    console.log('removed pin', pin)
    delete pins[pin]
  });
}

function setPin(data: pin){
  const isInput = data.type === 'INPUT'
  const isOutput = data.type === 'OUTPUT'

  // apply pin type change
  if( !pinClasses[data.num] || pinClasses[data.num].type!==data.type ){
    pinClasses[data.num] = isInput ? piPins.input( data.num ) : piPins.output( data.num )
  }

  const pin = pins[ data.num ]
  const already = isPinStateMatched(data, pin)
  if (already) {
    return // no work to do its already this way
  }

  pins[ data.num ] = data

  //mode change
  if( data.mode ){
    pinClasses[data.num].mode = data.mode
  }

  if (isInput) {
    // console.log('set input pin', data)
    return setInputPin(pinClasses[data.num] as InputPin, data)
  } else if (isOutput) {
    // console.log('set output pin', data)
    return setOutputPin(pinClasses[data.num] as OutputPin, data)
  }

  console.log('set pin', data)
}

function isPinStateMatched(pin: pin, matchPin: pin) {
  return pin && matchPin && pin.type === matchPin.type && pin.mode === matchPin.mode
}

function setInputPin(pinClass: InputPin, data: pin) {
  const targetPin = (pins[data.num] as any)
  targetPin.state = pinClass.getState()
}


function setOutputPin(pinClass: OutputPin, data: pin) {
  //mode change
  switch(data.mode){
    case 'HIGH':
      console.log(data.num, data.mode)
      pinClass.high()
      break;

    case 'LOW':
      console.log(data.num, data.mode)
      pinClass.low()
      break;
  }
}