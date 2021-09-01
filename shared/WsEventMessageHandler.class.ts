/** this may belong in shared */

import { WsMessage } from "../shared/types"
import { WsEventProcessor } from "./WsEventProcessor.class"

export class WsEventMessageHandler extends WsEventProcessor {
  async processWsEventMessage(
    data: WsMessage
  ): Promise<void> {
    const check = (this as any)[data.eventType]
    if(!check) {
      const message = `received unknown command ${data.eventType}`

      console.warn('unknown message', message)
      this.send('log', {
        message, data
      }, data)

      return
    }

    try {
      const method = (this as any)[data.eventType] as any
      method.call(this, data)
    } catch (err: any) {
      this.send('log', {
        message: `failed command ${data.eventType}`,
        error: Object.getOwnPropertyNames(err).reverse().reduce((a, key) => (a[key] = err[key]) && a || a, {} as any)
      }, data)
    }
  }
}
