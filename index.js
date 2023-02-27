const Net = require('net');
const express = require('express');
const path = require('path');

const listenPort = 80;
const mcHost = "mcmathtips.cf";
const mcPort = 8081;
const httpHost = "localhost";
const httpPort = 8080;
const timeout = 10000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.listen(8080);

const server = new Net.Server();
server.listen(listenPort, function() {
  //
});

server.on('connection', function(socket) {
  let client = null;
  
  let determinedClient = false;
  
  socket.on('data', function(chunk) {
    if(!determinedClient){
      let req = chunk.toString();
      if(req.startsWith("GET ")||req.startsWith("HEAD ")||req.startsWith("POST ")||req.startsWith("PUT ")||req.startsWith("DELETE ")||req.startsWith("CONNECT ")||req.startsWith("OPTIONS ")||req.startsWith("TRACE ")||req.startsWith("PATCH ")){
        makeClient(httpHost,httpPort,socket,c=>client=c);
      }else{
        makeClient(mcHost,mcPort,socket,c=>client=c);
      }
      determinedClient=true;
    }
    
    writeData(chunk);
  });

  socket.on('end', function() {
    if(client!=null)client.end();
  });

  socket.on('error', function(err) {
    //console.log(`Server Error: ${err}`);
  });

  async function writeData(chunk){
    let i=Date.now();
    while(client==null&&(Date.now()-i<timeout/10)){
      await new Promise(a=>setTimeout(a,10));
    }
    
    if(client==null&&socket!=null)return socket.end();
    
    client.write(chunk);
  }
});

function makeClient(host,port,socket,cb){
  const client = new Net.Socket();
  client.connect({ port: port, host: host }, function() {
    cb(client);
  });
      
  client.on('end', function() {
    if(socket!=null)socket.end();
  });

  client.on('data', function(chunk) {
    if(socket!=null)socket.write(chunk);
  });

  client.on('error', function(err) {
    //console.log(`Client Error: ${err}`);
  });
}