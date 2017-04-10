// var express = require('express');
// var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });

// });

// var port = process.env.PORT || 1337;
// app.listen(port, function() {
//   console.log(`Now listening for changes in *:${port}`);
// });

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  socket.on('stream', function() {
    console.log('stream');
  });
  socket.on('streamended', function() {
    console.log('streamended');
  });
});

var port = process.env.PORT || 443;
server.listen(port);
console.log(`Listening on port *:${port}`);