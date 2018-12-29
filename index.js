var fs =      require('fs');
var path =    require('path');
var express = require('express');
var app =     express();
var http =    require('http').Server(app);
var io =      require('socket.io')(http);
var port =    process.env.PORT || 80;
var ping =    require('net-ping-hr');
var session = ping.createSession();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/logs', function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../APPLICATION_DATA/logs/index.html'));
});

app.use('/iconic', express.static(path.resolve(__dirname + '/../APPLICATION_DATA/logs/iconic/svg')));

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
              console.log (target + " > " + error.toString ());
              socket.emit('receive-ping', params.host + " > " + error.toString());
          }
          else {
              console.log (target + " >  Response Received - " + formattedMs + "ms.");
              socket.emit('receive-ping', params.host + " > Response Received - " + formattedMs + "ms.");
          }
      });
    }, 750);
  });

  socket.on('ping-complete', function(logs) {
    fs.writeFile('../APPLICATION_DATA/logs/log_' + new Date().getTime() + '.txt', logs, function(err, data) {
      if (err) console.log(err);
      io.emit('update-broadcast');
    });
  });

  socket.on('request-listings', function() {
    fs.readdir('../APPLICATION_DATA/logs', function(err, items) {
      if (err) socket.emit('listings-error', err);
      socket.emit('listings-received', items);
    });
  });

  socket.on('request-read-log', function(filename) {
    fs.readFile('../APPLICATION_DATA/logs/' + filename, 'utf-8', function(err, contents) {
      if (err) socket.emit('listings-error', err);
      socket.emit('request-read-log-complete', contents);
    });
  });

  socket.on('request-delete-log', function(filename) {
    fs.unlink('../APPLICATION_DATA/logs/' + filename, function(err) {
      if (err) socket.emit('listings-error', err);
      io.emit('update-broadcast');
    });
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
