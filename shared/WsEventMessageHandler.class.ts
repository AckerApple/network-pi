/** this may belong in shared */

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
    } catch (err) {
      this.send('log', {
        message: `failed command ${data.eventType}`,
        error: Object.getOwnPropertyNames(err).reverse().reduce((a, key) => (a[key] = err[key]) && a || a, {} as any)
      }, data)
    }
  }
}
