/*global module*/
/*global require*/
/*global process*/
/*global __dirname*/

(function () {

  'use strict';

  var fs = require('fs');
  var logFile = __dirname + "/.tmp/ipc.log";

  var Ipc = require('easy-ipc'),
    ipc = new Ipc({
      socketPath: __dirname + '/.tmp/ipc-test.sock',
      port: 7100,
      host: 'localhost'
    });

  ipc.on('listening', function (server) {
      // server is an instance of net.Server
      // here we are in server-mode
      ipc.on('data', function (data, conn, server) {
        log("data", data);
      });
    })
    .start();

  module.exports = function () {
  };

  module.exports.send = function (args) {
    log("args", args);
    ipc.on('connect', function (conn) {
      conn.write(args);
    });
  };

  function log(message, data) {
    fs.appendFileSync(logFile, process.pid + " :: " + message + " => " + JSON.stringify(data) + "\n");
  }

})();