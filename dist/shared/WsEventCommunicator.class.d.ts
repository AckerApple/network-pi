import { WsMessage } from "./types";
import { Subject } from "rxjs";
export declare class WsEventCommunicator {
    url?: string;
    reconnectTimer: any;
    disconnectAsked: boolean;
    lastMessage: WsMessage;
    loadCount: number;
    ws: WebSocket;
    promises: {
        [id: string]: {
            res: (data: WsMessage) => any;
            rej: () => any;
        };
    };
    $onopen: Subject<WebSocket>;
    $onmessage: Subject<WsMessage>;
    constructor(url?: string);
    connect(): void;
    initSocket(): void;
    disconnect(): void;
    reconnect(): void;
    sendWaitMessageResponse<T>(message: WsMessage): Promise<T>;
    socketListen(): void;
    send(eventType: string, data?: any): void;
    sendWaitResponse<T>(eventType: string, data?: any): Promise<T>;
}