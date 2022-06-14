import { WsEventCommunicatorBase } from './WsEventCommunicatorBase.class'
import * as WS from 'ws'

export class WsEventCommunicatorBrowser extends WsEventCommunicatorBase {

  async initSocket() {
    try {
      const ws = new WS(this.url as string)
      this.socketListen(ws as any)
    } catch (err) {
      console.error('failed to init socket', err);
    }
  }
}
