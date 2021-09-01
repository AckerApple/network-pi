import * as WebSocket from "ws";
import { WsMessage } from "../shared/types";
import { Subject } from "rxjs";
export declare class SocketSwitch {
    wss: WebSocket.Server;
    constructor(wss: WebSocket.Server);
    sendCleanToAll(eventType: string, data: any, responseTo?: WsMessage): void;
    sendToAll(eventType: string, data: any, responseTo?: WsMessage): void;
}
export declare class WsEventProcessor {
    ws: WebSocket;
    $message: Subject<WsMessage>;
    constructor(ws: WebSocket);
    monitorMessages(): this;
    onMessage(dataString: string): Promise<void>;
    send(eventType: string, data: any, responseTo?: WsMessage): void;
    sendClean(eventType: string, data: any, responseTo?: WsMessage): void;
}
export declare function plainObject<T>(Class: T, { seen }?: {
    seen?: any[];
}): T;
