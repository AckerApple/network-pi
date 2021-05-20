import { WsMessage } from "../shared/types"
import { WsEventProcessor } from "./WsEventProcessor.class"

export class WsEventMessageHandler extends WsEventProcessor {
  async processWsEventMessage(
    data: WsMessage
  ): Promise<void> {
    if(!this[data.eventType]) {
      const message = `received unknown command ${data.eventType}`

      console.warn('unknown message', message)
      this.send('log', {
        message, data
      }, data)

      return
    }

    try {
      this[data.eventType].call(this, data)
    } catch (error) {
      this.send('log', {
        message: `failed command ${data.eventType}`, error
      }, data)
    }
  }
}
