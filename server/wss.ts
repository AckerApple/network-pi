import * as WebSocket from "ws"
import * as os from "os"
import { pin, pi, Pin, InputPin, OutputPin } from "ack-pi"
const { exec } = require("child_process");
export interface WsMessage {
  [index:string]: any
  eventType: 'setPins' | 'command' | 'log' | 'getPins'
}

export const wss = new WebSocket.Server({noServer: true})

export interface pins{
  [index:number]:pin
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
    "mode" : "low"
  }
}
const pinClasses:pinClasses = {}

wss.on('connection', onConnect)
wss.on('open', function(ws) {
  console.log('opened')
  ws.send('---- open something -----')
})

async function onConnect(ws) {
  console.log('connected')
  ws.on('message', onMessage)

  async function onMessage(dataString:string) {
    try{
      const data: WsMessage = JSON.parse( dataString )

      switch (data.eventType) {
        case 'setPins':
          setPins( data );
          break;

        case 'getPins':
          ws.send( JSON.stringify({
            eventType: 'pins', pins
          }))
          break;

        case 'command':
          const reply = {
            eventType: 'command-result',
            command: data.command,
            result: await runCommand(data.command)
          }
          ws.send(JSON.stringify(reply))
          break;

        default:
          ws.send(JSON.stringify({
            eventType: 'log',
            message: {
              message: `received unknown command ${data.eventType}`,
              data
            }
          }))
      }

    }catch(e){
      console.error(e)
      return
    }
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
  for(let x in data){
    data[x].num = Number( <any>x )
    setPin( data[x] )
  }
}

function setPin( data:pin ){
  //apply pin type change
  if( !pinClasses[data.num] || pinClasses[data.num].type!==data.type ){
    pinClasses[data.num] = data.type==='INPUT' ? pinst.input( data.num ) : pinst.output( data.num )
  }

  //mode change
  if( data.mode ){
    pinClasses[data.num].mode = data.mode
    const pClass:OutputPin = <OutputPin>pinClasses[data.num]

    //mode change
    switch(data.mode){
      case 'high':
        console.log(data.num,'high')
        pClass.high()
        break;

      case 'low':
        console.log(data.num,'low')
        pClass.low()
        break;
    }
  }

  console.log('set pin', data)
  pins[ data.num ] = data
}