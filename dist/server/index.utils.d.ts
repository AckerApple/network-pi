/// <reference types="node" />
import * as WebSocket from "ws";
import * as http from "http";
export declare function startHttpWebSocketServer({ port, host, httpStaticFilePaths, onRequest }: {
    port: number;
    host: string;
    httpStaticFilePaths: string[];
    onRequest?: (req: http.IncomingMessage, res: http.ServerResponse) => any;
}): {
    http: http.Server;
    wss: WebSocket.Server;
};
export declare function addWebSocketToHttpServer(server: http.Server): WebSocket.Server;
export declare function upgradeHttpServerToWebSocket(request: any, socket: any, head: any, wss: WebSocket.Server): void;
