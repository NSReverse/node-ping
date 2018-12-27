var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var ping = require('net-ping-hr');
var session = ping.createSession();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('Client connected from ' + socket.handshake.address);

  socket.on('request-ping', function(params) {
    setTimeout(() => {
      /*
      ping.promise.probe(params.host, {
        timeout: 10
      }).then(function (res) {
        if (res.alive) {
          socket.emit('receive-ping', params.host + ' > Response made - ' + res.time + 'ms');
        }
        else {
          socket.emit('receive-ping', 'Host unreachable.');
        }
      });
      */
     session.pingHost (params.host, function (error, target, sent, received) {
          var rawMs = received - sent;
          var formattedMs = parseFloat(Math.round(rawMs * 100) / 100).toFixed(2);
      
          if (error) {
              console.log (target + ": " + error.toString ());
              socket.emit('receive-ping', params.host + ": " + error.toString());
          }
          else {
              console.log (target + ": Response Received - " + formattedMs + "ms.");
              socket.emit('receive-ping', params.host + ": Response Received - " + formattedMs + "ms.");
          }
      });
    }, 750);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
