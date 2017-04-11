// This server file has been finalized for the main repo on 2017/05/10
// Patches and changes will be applied directly to the main project "interviewer.dc"

/*
 * All credit for base server configuration, including Signaling-Server.js, goes to:
 * Muaz Khan      - www.MuazKhan.com
 * MIT License    - www.WebRTC-Experiment.com/licence
 * Documentation  - github.com/muaz-khan/RTCMultiConnection
*/

/*
 * Environment variables
 *   SOCKETIO_PORT (default: 443)
 *   USE_HTTPS (default: false)
 *   IP (default: 127.0.0.1)
*/

///////////////////////////////////////
//////////////// HTTPS ////////////////
///////////////////////////////////////
// Please use HTTPs on non-localhost domains.
var isUseHTTPs = process.env.USE_HTTPS || false;

var fs = require('fs');
var path = require('path');

// Check if you are on windows platform
var resolveURL = function(url) {
  var isWin = !!process.platform.match(/^win/);
  if (!isWin) {
    return url;
  }

  return url.replace(/\//g, '\\');
};

// see how to use a valid certificate: // https://github.com/muaz-khan/WebRTC-Experiment/issues/62
var httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, resolveURL('rtc-dependencies/fake-keys/privatekey.pem'))),
  cert: fs.readFileSync(path.join(__dirname, resolveURL('rtc-dependencies/fake-keys/certificate.pem')))
};

//////////////////////////////////////////////////////////
///////////////// SOCKET IO SERVER SETUP /////////////////
//////////////////////////////////////////////////////////
var express = require('express')();
var http = require(isUseHTTPs ? 'https' : 'http');
var port = process.env.SOCKETIO_PORT || 443;

var server;
isUseHTTPs ? server = http.createServer(httpsOptions, express) : server = http.createServer(express);

server.on('error', function(e) {
  if (e.code === 'EADDRINUSE') {
    var socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';
    console.log('\x1b[31m%s\x1b[0m ', '[EADDRINUSE] Unable to listen on port: ' + e.port + '. ' + socketURL + ' is already in use.');
  }
});

server = server.listen(port);
console.log('[socket.io server port]: ' + port);
// var addr = server.address();
// var domainURL = (isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';
// console.log('[socket.io server] connection.socketURL = "' + domainURL + '";');
// if (addr.address !== '127.0.0.1' && !isUseHTTPs) {
//   console.log('\x1b[31m%s\x1b[0m ', 'Please set isUseHTTPs=true to make sure audio,video and screen demos can work on Google Chrome as well.');
// }

require('./rtc-dependencies/Signaling-Server.js')(server, function(socket) {
  try {
    var params = socket.handshake.query;

    // "socket" object is totally in your own hands! Do whatever you want!
    // In your HTML page, you can access socket as following:
        // connection.socketCustomEvent = 'custom-message';
        // var socket = connection.getSocket();
        // socket.emit(connection.socketCustomEvent, { test: true });

    if (!params.socketCustomEvent) {
      params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
      try {
        socket.broadcast.emit(params.socketCustomEvent, message);
      } catch (e) {}
    });
  } catch (e) {}
});