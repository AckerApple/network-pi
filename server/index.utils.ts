const nodeStatic = require('node-static')
import * as WebSocket from "ws"
import * as http from "http"
import * as url from "url"

export function startHttpWebSocketServer({
  port = 3000,
  host = '0.0.0.0',
  httpStaticFilePaths,
  onRequest = () => undefined
}: {
  port: number
  host: string
  httpStaticFilePaths: string[]
  onRequest?: (req: http.IncomingMessage, res: http.ServerResponse) => any
}
): {http:http.Server, wss: WebSocket.Server} {
  console.log('serving static files from', httpStaticFilePaths)

  const server = http.createServer(async (req,res)=> {
    onRequest(req, res)

    const reqUrl = req.url as string
    const rUrl = {
      path  : reqUrl.split('?').shift(),
      query : url.parse(reqUrl, true).query
    }

    let result: {status: number, headers: {[name: string]: string}} = { status: 404, headers: {}}
    for (const path of httpStaticFilePaths) {
      var file = new nodeStatic.Server(path) // default includes {cache:3600}
      result = await new Promise((resolve, reject) => {        
        try {
          file.servePath(rUrl.path, 200, {}, req, res, (status: number, headers: {[name: string]: string}) => {
            resolve({ status, headers })
          })
        } catch (err) {
          reject(err)
        }
      })

      if (result.status < 400) {
        break
      }
    }

    // should we cause 404?
    if (result.status >= 400) {
      // cause request to close with 404 by fully serving to nodeStatus a bad path
      new nodeStatic.Server( httpStaticFilePaths[0] ).serve(req,res)
    }

    res.writeHead(result.status, result.headers)
    res.end()
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
