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
export interface pin{
  number:number
}

export interface pins{
  [index:string]:pin
}

const basePath = __dirname
console.log('basePath',basePath)

//const index = fs.readFileSync(path.join(basePath,"index.html")).toString()

const server = http.createServer((req,res)=>{
  const rUrl={
    path  : req.url.split('?').shift(),
    query : url.parse(req.url, true).query
  }

  //console.log("urlParts", rUrl)
  file.serve(req, res);
  /*
  if( rUrl.path==='/' ){
    res.writeHead(200, {"Content-Type": "text/html"})
    return res.end( 'no index' )
    //return res.end( index )
  }

  res.writeHead(404, {"Content-Type": "text/plain"})
  res.end("404 - page not found")
  */
})

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/foo') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      console.log('connection foo')
      wss.emit('connection', ws, request)
    });
  } else if (pathname === '/bar') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      console.log('connection bar')
      wss.emit('connection', ws, request)
    });
  } else {
    socket.destroy()
  }
})

nconf.argv().env() // read params
const host = nconf.get('host') || undefined
const port = nconf.get('port') || 3000

server.listen(port, host, ()=>{
  console.log(`server started - ${host || 'localhost'}:${port}`)
})