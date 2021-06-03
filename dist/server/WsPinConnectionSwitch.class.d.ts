import { WsMessage } from "../shared/types";
import { WsEventMessageHandler } from "../shared/WsEventMessageHandler.class";
export declare class WsPinConnectionSwitch extends WsEventMessageHandler {
    setPins(data: WsMessage): void;
    getPins(data: WsMessage): void;
    command(data: WsMessage): Promise<void>;
    wifiNetworks(data: WsMessage): Promise<void>;
    wifiConnections(data: WsMessage): Promise<void>;
    bluetoothDevices(data: WsMessage): Promise<void>;
    networkInterfaces(data: WsMessage): Promise<void>;
    wifiConnect(data: WsMessage): Promise<void>;
}
