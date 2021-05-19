import { WsMessage } from "../shared/types";
import { ConnectionSwitch } from "./index.utils";
export declare class WsPinConnectionSwitch extends ConnectionSwitch {
    setPins(data: WsMessage): void;
    getPins(data: WsMessage): void;
    command(data: WsMessage): Promise<void>;
}
