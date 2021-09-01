const nodeStatic = require('node-static')
import * as WebSocket from "ws"
import * as http from "http"
import * as url from "url"

export function startHttpWebSocketServer({
  port = 3000,
  host = '0.0.0.0',
  httpStaticFilePaths
}: {port: number, host: string, httpStaticFilePaths: string[]}
): {http:http.Server, wss: WebSocket.Server} {
  console.log('serving static files from', httpStaticFilePaths)

  const server = http.createServer((req,res)=>{
    console.log('request', req.url)
    const reqUrl = req.url as string
    const rUrl = {
      path  : reqUrl.split('?').shift(),
      query : url.parse(reqUrl, true).query
    }

    httpStaticFilePaths.forEach(path => {
      var file = new nodeStatic.Server(path) // default includes {cache:3600}
      file.serve(req, res)
    })
  })

  const wss = addWebSocketToHttpServer(server)

  server.listen(port, host, ()=>{
    console.log(`server started - ${host}:${port}`)
  })

  return {http: server, wss}
}

export function addWebSocketToHttpServer(server: http.Server): WebSocket.Server {
  // console.log('upgrading http server...')
  const wss = new WebSocket.Server({noServer: true})
  server.on('upgrade', (request, socket, head) => {
    // console.log('upgraded http server')
    upgradeHttpServerToWebSocket(request, socket, head, wss)
  })
  return wss
}

export function upgradeHttpServerToWebSocket(
  request: any,
  socket: any,
  head: any,
  wss: WebSocket.Server
) {
  // console.log('starting websocket server...')
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      // console.log('ws connection created on path /ws')
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
}
