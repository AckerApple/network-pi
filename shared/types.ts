import { pin, Pin, InputPin, OutputPin } from "ack-pi"

export type eventTypes = 'pins' | 'setPins' | 'command' | 'log' | 'getPins' | 'commandResult'
export interface WsMessage {
  responseId?: string
  eventType: string // eventTypes
  data: unknown // let callers define the type
}

export interface Pins {
  [index:number] : pin
}

export interface PinClasses{
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