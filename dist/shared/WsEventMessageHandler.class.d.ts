/** this may belong in shared */
import { WsMessage } from "../shared/types";
import { WsEventProcessor } from "./WsEventProcessor.class";
export declare class WsEventMessageHandler extends WsEventProcessor {
    processWsEventMessage(data: WsMessage): Promise<void>;
}
