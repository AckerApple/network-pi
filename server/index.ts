const nodeStatic = require('node-static');
import * as http from "http"
import * as url from "url"
import * as nconf from "nconf"
import { wss } from "./wss"
import * as path from "path"
// import * as fs from "fs"
const serveFilesFrom = path.join(__dirname,'../app/dist/network-pi-webapp')
console.log('serving static files from', serveFilesFrom)
var file = new(nodeStatic.Server)(serveFilesFrom);

// configurations
nconf.argv().env() // read params
const host = nconf.get('host') || undefined
const port = nconf.get('port') || 3000

export interface pin{
  number:number
}

export interface pins{
  [index:string]:pin
}

const basePath = __dirname
console.log('basePath',basePath)

const server = http.createServer((req,res)=>{
  console.log('request', req.url)
  const rUrl={
    path  : req.url.split('?').shift(),
    query : url.parse(req.url, true).query
  }

  file.serve(req, res);
})

server.on('upgrade', addWsToHttpServer)

function addWsToHttpServer(request, socket, head) {
  console.log('starting websocket')
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      console.log('ws connection created on path /ws')
      wss.emit('connection', ws, request)
    });
  } else {
    socket.destroy()
  }
}

server.listen(port, host, ()=>{
  console.log(`server started - ${host || 'localhost'}:${port}`)
})