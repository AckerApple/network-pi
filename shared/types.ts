import { pin, Pin, InputPin, OutputPin } from "ack-pi"

export type eventTypes = 'pins' | 'setPins' | 'command' | 'log' | 'getPins' | 'command-result'
export interface WsMessage {
  responseId?: string
  eventType: eventTypes
  data: any
}

export interface Pins {
  [index:number] : pin
}

export interface pinClasses{
  [index:number]: InputPin | OutputPin | Pin
}

export interface PinState {
  type : "INPUT" | "OUTPUT"
  mode? : "HIGH" | "LOW"
}

export interface ServerPinConfig extends PinState {
  num  : 0,
}


export interface ServerPinsSummary {
  [index: number] : pin
}