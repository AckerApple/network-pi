const { exec } = require("child_process")
import { WsMessage } from "../shared/types"
import { setPins, pins } from "./index.pins"
import { WsEventMessageHandler } from "../shared/WsEventMessageHandler.class"
import {
  networkInterfaces,
  bluetoothDevices,
  wifiConnections,
  wifiNetworks, audio,
} from "systeminformation"

// import * as wifi from "node-wifi"
const wifi = require('node-wifi')

export class WsPinConnectionSwitch extends WsEventMessageHandler {
  setPins(data: WsMessage) {
    setPins( data.data )
    this.send('pins', pins, data) // echo
    console.log('ws setPins')
  }

  getPins(data: WsMessage) {
    this.send('pins', pins, data)
  }

  async command(data: WsMessage) {
    this.send('commandResult', await runCommand(data.data), data)
  }

  async wifiNetworks(data: WsMessage) {
    const results = await wifiNetworks()
    this.send('wifiNetworks', results, data)
  }

  async wifiConnections(data: WsMessage) {
    const results = await wifiConnections()
    this.send('wifiConnections', results, data)
  }

  async bluetoothDevices(data: WsMessage) {
    try {
      const results = await bluetoothDevices()
      this.send('bluetoothDevices', results, data)
    } catch (err) {
      console.error('error fetching bluetooth devices', err)
      this.send('bluetoothDevices', [], data)
    }
  }

  async audioDevices(data: WsMessage) {
    const results = await audio()
    this.send('audioDevices', results, data)
  }

  async networkInterfaces(data: WsMessage) {
    const results = await networkInterfaces()
    this.send('networkInterfaces', results, data)
  }

  async wifiConnect(data: WsMessage) {
    const {ssid, password, iface} = data.data

    // establish wifi abilities
    wifi.init({iface})

    const result = await wifi.connect({ ssid, password })
      .catch((err: any) => {
        this.send('wifiConnections', err, data)
        return err
      })
      .then((x: any) => {
        this.wifiConnections(data)
        return x
      })

    console.log('wifi result', result)
  }
}

/** browser debug any sent command */
function runCommand(command: string) {
  return new Promise((res, rej) => {
    exec(command, (error: Error, stdout: string, stderr: string) => {
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
