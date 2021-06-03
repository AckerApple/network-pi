import { pin, InputPin, OutputPin } from "ack-pi";
import { ServerPinsSummary } from "../shared/types";
export declare const pins: ServerPinsSummary;
export declare function setPins(data: ServerPinsSummary): void;
export declare function setPin(data: pin): void;
export declare function isPinStateMatched(pin: pin, matchPin: pin): boolean;
export declare function setInputPin(pinClass: InputPin, data: pin): void;
export declare function setOutputPin(pinClass: OutputPin, data: pin): void;
