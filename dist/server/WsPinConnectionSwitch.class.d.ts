import { ServerPinsSummary, WsMessage } from "../shared/types";
import { WsEventMessageHandler } from "../shared/WsEventMessageHandler.class";
export declare class WsPinConnectionSwitch extends WsEventMessageHandler {
    setPins(data: WsMessage & {
        data: ServerPinsSummary;
    }): void;
    getPins(data: WsMessage): void;
    command(data: WsMessage & {
        data: string;
    }): Promise<void>;
    wifiNetworks(data: WsMessage): Promise<void>;
    wifiConnections(data: WsMessage): Promise<void>;
    bluetoothDevices(data: WsMessage): Promise<void>;
    audioDevices(data: WsMessage): Promise<void>;
    networkInterfaces(data: WsMessage): Promise<void>;
    wifiConnect(data: WsMessage & {
        data: {
            ssid: string;
            password: string;
            iface: string;
        };
    }): Promise<void>;
}
