import { WsMessage } from "../shared/types";
import { WsEventMessageHandler } from "./WsEventMessageHandler.class";
export declare class WsPinConnectionSwitch extends WsEventMessageHandler {
    setPins(data: WsMessage): void;
    getPins(data: WsMessage): void;
    command(data: WsMessage): Promise<void>;
}
