/// <reference types="node" />
import * as WebSocket from "ws";
import * as http from "http";
import { WsMessage } from "../shared/types";
import { Subject } from "rxjs";
export declare function startHttpWebSocketServer({ port, host, httpStaticFilePath }: {
    port: number;
    host: string;
    httpStaticFilePath: string;
}): {
    http: http.Server;
    wss: WebSocket.Server;
};
export declare function addWebSocketToHttpServer(server: http.Server): WebSocket.Server;
export declare function upgradeHttpServerToWebSocket(request: any, socket: any, head: any, wss: WebSocket.Server): void;
export declare class ConnectionSwitch {
    ws: WebSocket.connection;
    $message: Subject<WsMessage>;
    constructor(ws: WebSocket.connection);
    onMessage(dataString: string): Promise<void>;
    processEvent(eventType: string, data: WsMessage): Promise<void>;
    send(eventType: string, data: any, responseTo?: WsMessage): void;
}
