/*global module*/
/*global console*/
/*global require*/
/*global __dirname*/
/*global process*/

(function () {

  'use strict';

  var Ipc = require('easy-ipc'),
    ipc = new Ipc({
      socketPath: __dirname + '/.tmp/ipc-test.sock',
      port: 7100,
      host: 'localhost',
      reconnect: false
    });

  ipc
    .on('listening', function (server) {
      ipc.on('data', function (data, conn, server) {
        console.log('got data:', data);
        conn.write(true);
      });
    })
    .once('connect', function (conn) {
      conn.write(process.argv);
      ipc.on('data', function (data, conn) {
        if (data === true) {
          conn.end();
          process.exit(0);
        }
      });
    })
    .start();

})();