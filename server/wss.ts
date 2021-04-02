import * as WebSocket from "ws"
import * as os from "os"
import { pin, pi, Pin, InputPin, OutputPin } from "ack-pi"
const { exec } = require("child_process");

export type eventTypes = 'pins' | 'setPins' | 'command' | 'log' | 'getPins' | 'command-result'
export interface WsMessage {
  [index:string]: any
  eventType: eventTypes
}

export const wss = new WebSocket.Server({noServer: true})

export interface pins{
  [index:number] : pin
}

export interface pinClasses{
  [index:number]:InputPin|OutputPin|Pin
}

const isPiPlatform = os.platform()==="linux"
const pinst = pi( isPiPlatform )
const pins:pins = {
  "0":{
    "num"  : 0,
    "type" : "OUTPUT",
    "mode" : "LOW"
  },
  "1":{
    "num"  : 1,
    "type" : "INPUT",
    // "mode" : "low"
  }
}
const pinClasses:pinClasses = {}

wss.on('connection', onConnect)
wss.on('open', (ws) => console.log('opened'))

async function onConnect(ws) {
  console.log('connected')
  ws.on('message', onMessage)

  async function onMessage(dataString:string) {
    try{
      const data: WsMessage = JSON.parse( dataString )

      switch (data.eventType) {
        case 'setPins':
          // console.log('dataString', typeof dataString, typeof data, typeof data.data, data)
          setPins( data.data );
          send('pins', pins)
          break;

        case 'getPins': 'pins'
          // console.log('getting pins')
          send('pins', pins)
          break;

        case 'command':
          send('command-result', await runCommand(data.data))
          break;

        default:
          send('log', {
            message: `received unknown command ${data.eventType}`,
            data
          })
      }

    }catch(e){
      console.error(e)
      return
    }
  }

  function send(eventType: eventTypes, data: any) {
    ws.send( JSON.stringify({
      eventType, data
    }))
  }
}

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

function setPins( data:pins ){
  // console.log('data', typeof data, data)
  for(let x in data){
    data[x].num = Number( <any>x )
    // data[x].num = x as any
    setPin( data[x] )
  }
}

function setPin( data:pin ){
  const isInput = data.type === 'INPUT'
  const isOutput = data.type === 'OUTPUT'

  //apply pin type change
  if( !pinClasses[data.num] || pinClasses[data.num].type!==data.type ){
    pinClasses[data.num] = isInput ? pinst.input( data.num ) : pinst.output( data.num )
  }

  pins[ data.num ] = data

  //mode change
  if( data.mode ){
    pinClasses[data.num].mode = data.mode
  }

  if (isInput) {
    console.log('set input pin', data)
    setInputPin(pinClasses[data.num] as InputPin, data)
  } else if (isOutput) {
    console.log('set output pin', data)
    setOutputPin(pinClasses[data.num] as OutputPin, data)
  } else {
    console.log('set pin', data)
  }
}

function setInputPin(pinClass: InputPin, data: pin) {
  const targetPin = (pins[data.num] as any)
  targetPin.state = pinClass.getState()
  console.log('targetPin', targetPin)
}


function setOutputPin(pinClass: OutputPin, data: pin) {
  //mode change
  switch(data.mode){
    case 'HIGH':
      console.log(data.num,'high')
      pinClass.high()
      break;

    case 'LOW':
      console.log(data.num,'low')
      pinClass.low()
      break;
  }
}