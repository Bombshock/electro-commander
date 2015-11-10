/*global angular*/

(function () {
  'use strict';

  var electron_ipc = require('ipc');
  var remote = require("remote");

  angular.module("app").run(ArgvProcess);
  electron_ipc.send('asynchronous-message', 'ping');
  electron_ipc.sendSync("ping");

  ArgvProcess.$inject = ["argvHandler"];

  function ArgvProcess(argvHandler) {
    argvHandler(remote.process.argv);
    electron_ipc.on('argv', argvHandler);
  }

})();