import * as os from "os"
import * as WebSocket from "ws"
import { pin, pi, InputPin, OutputPin } from "ack-pi"
import { eventTypes, pinClasses, Pins, ServerPinsSummary, WsMessage } from "../shared/types";
import { ConnectionSwitch } from "./index.utils";
const { exec } = require("child_process");

export class WsPinConnectionSwitch extends ConnectionSwitch {
  setPins(data: WsMessage) {
    setPins( data.data )
    this.send('pins', pins, data) // echo
  }

  getPins(data: WsMessage) {
    this.send('pins', pins, data)
  }

  async command(data: WsMessage) {
    this.send('command-result', await runCommand(data.data), data)
  }
}

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