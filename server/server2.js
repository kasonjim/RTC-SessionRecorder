/*
 * All credit for original server configuration, including Signaling-Server.js, goes to:
 * Muaz Khan      - www.MuazKhan.com
 * MIT License    - www.WebRTC-Experiment.com/licence
 * Documentation  - github.com/muaz-khan/RTCMultiConnection
*/

var fs = require('fs');
var path = require('path');

// Check if you are on windows platform
var resolveURL = function(url) {
  var isWin = !!process.platform.match(/^win/);
  if (!isWin) return url;
  return url.replace(/\//g, '\\');
};

// Please use HTTPs on non-localhost domains.
var isUseHTTPs = false;
// var port = 443;
var port = process.env.PORT || 9001;


// see how to use a valid certificate: // https://github.com/muaz-khan/WebRTC-Experiment/issues/62
var options = {
  key: fs.readFileSync(path.join(__dirname, resolveURL('rtc-dependencies/fake-keys/privatekey.pem'))),
  cert: fs.readFileSync(path.join(__dirname, resolveURL('rtc-dependencies/fake-keys/certificate.pem')))
};

// force auto reboot on failures
var autoRebootServerOnFailure = false;

// You don't need to change anything below
var server = require(isUseHTTPs ? 'https' : 'http');
var url = require('url');

var app;

if (isUseHTTPs) {
  app = server.createServer(options, require('express')());
} else {
  app = server.createServer(require('express')());
}

var runServer = function() {
  app.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      if (e.address === '0.0.0.0') {
        e.address = 'localhost';
      }

      var socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';

      console.log('------------------------------');
      console.log('\x1b[31m%s\x1b[0m ', 'Unable to listen on port: ' + e.port);
      console.log('\x1b[31m%s\x1b[0m ', socketURL + ' is already in use. Please kill below processes using "kill PID".');
      console.log('------------------------------');

    }
  });

  app = app.listen(port, process.env.IP || '0.0.0.0', function(error) {
    var addr = app.address();

    if (addr.address === '0.0.0.0') {
      addr.address = 'localhost';
    }

    var domainURL = (isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

    console.log('------------------------------');
    console.log('socket.io is listening at:' + domainURL);
    console.log('\x1b[31m%s\x1b[0m ', '[set] connection.socketURL = "' + domainURL + '";');
    console.log('------------------------------');

    if (addr.address != 'localhost' && !isUseHTTPs) {
      console.log('Warning:');
      console.log('\x1b[31m%s\x1b[0m ', 'Please set isUseHTTPs=true to make sure audio,video and screen demos can work on Google Chrome as well.');
    }
  });

  require('./rtc-dependencies/Signaling-Server.js')(app, function(socket) {
    try {
      var params = socket.handshake.query;

      // "socket" object is totally in your own hands!
      // do whatever you want!

      // in your HTML page, you can access socket as following:
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
};

if (autoRebootServerOnFailure) {
    // auto restart app on failure
    var cluster = require('cluster');
    if (cluster.isMaster) {
        cluster.fork();

        cluster.on('exit', function(worker, code, signal) {
            cluster.fork();
        });
    }

    if (cluster.isWorker) {
        runServer();
    }
} else {
    runServer();
}