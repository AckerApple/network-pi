import { WsEventCommunicatorBase } from './WsEventCommunicatorBase.class'

export class WsEventCommunicatorBrowser extends WsEventCommunicatorBase {
  async initSocket() {
    try {
      const ws = new WebSocket(this.url as string)
      this.socketListen(ws)
    } catch (err) {
      console.error('failed to init socket', err);
    }
  }
}
