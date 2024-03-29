import { pin, Pin, InputPin, OutputPin } from "ack-pi";
export declare type eventTypes = 'pins' | 'setPins' | 'command' | 'log' | 'getPins' | 'commandResult';
export interface WsMessage {
    responseId?: string;
    eventType: string;
    data: unknown;
}
export interface Pins {
    [index: number]: pin;
}
export interface PinClasses {
    [index: number]: InputPin | OutputPin | Pin;
}
export interface PinState {
    type: "INPUT" | "OUTPUT";
    mode?: "HIGH" | "LOW";
}
export interface ServerPinConfig extends PinState {
    num: 0;
}
export interface ServerPinsSummary {
    [index: number]: pin;
}
