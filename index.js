var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3006;
var ping = require('ping');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('Client connected from ' + socket.handshake.address);

  socket.on('request-ping', function(params) {
    setTimeout(() => {
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
    }, 750);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
