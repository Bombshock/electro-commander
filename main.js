/*global require*/
/*global process*/
/*global __dirname*/

(function () {
  'use strict';

  var mainWindow;
  var app = require('app');
  var fs = require('fs');
  var Ipc = require('easy-ipc');
  var BrowserWindow = require('browser-window');
  var exec = require("child_process").execSync;
  var mainWindowConfigPath = __dirname + "/windows/main/conf/window.json";
  var electron_ipc = require('ipc');
  var masterIpc;
  var argv = process.argv || [];
  var debugMode = argv.indexOf("--debug") !== -1;

  var ipc = new Ipc({
    port: 7100,
    host: 'localhost',
    reconnect: false
  });

  electron_ipc.on('ping', function (event) {
    masterIpc = event.sender;
    event.returnValue = 'pong';
  });

  app.on('ready', function () {
    ipc
      .on('listening', function () {
        masterProcess();
        ipc.on('data', function (data, conn) {
          if (masterIpc) {
            masterIpc.send('argv', data);
          }
          conn.write(true);
        });
      })
      .once('connect', function (conn) {
        conn.write(process.argv);
        ipc.on('data', function (data, conn) {
          if (data === true) {
            conn.end();
          }
        });
        ipc.on('close', function () {
          process.exit(0);
        });
      })
      .start();
  });

  function masterProcess() {
    var screen = require('screen');
    var displays = screen.getAllDisplays();
    var externalDisplay = displays[displays.length - 1];

    var config = {
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y
    };

    try {
      config = require(mainWindowConfigPath);
    } catch (e) {
      //config not found? like i give a fuck
    }

    config.icon = __dirname + '/resources/icon.png';

    BrowserWindow.addDevToolsExtension(__dirname + '/windows/batarang.crx');

    mainWindow = new BrowserWindow(config);
    mainWindow.loadUrl('file://' + __dirname + '/windows/main/index.html');
    mainWindow.maximize();

    if (debugMode) {
      //mainWindow.toggleDevTools();
    } else {
      mainWindow.setMenu(null);
    }

    mainWindow.setTitle("electro-commander");

    mainWindow.on("close", function () {
      var data = mainWindow.getBounds();
      fs.writeFileSync(mainWindowConfigPath, JSON.stringify(data, null, 2));
    });
    mainWindow.on('close', exit);
  }

  process.on('exit', exit);
  function exit(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    exec("taskkill /pid " + process.pid + " /f /t ");
  }

})();