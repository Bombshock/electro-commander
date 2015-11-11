/*global require*/
/*global process*/
/*global __dirname*/

(function () {
  'use strict';

  var mainWindow, trayIcon;
  var app = require('app');
  var Tray = require('tray');
  var Menu = require('menu');
  var fs = require('fs');
  var Ipc = require('easy-ipc');
  var BrowserWindow = require('browser-window');
  var exec = require("child_process").execSync;
  var mainWindowConfigPath = __dirname + "/windows/main/conf/window.json";
  var electron_ipc = require('ipc');
  var masterIpc;
  var argv = process.argv || [];
  var devMode = argv.indexOf("--dev") !== -1;
  var trayMode = argv.indexOf("--tray") !== -1;

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
    var startMaximized = false;

    trayIcon = new Tray(__dirname + "/resources/icon.png");

    var contextMenu = Menu.buildFromTemplate([{
      label: 'close',
      click: exit
    }]);
    trayIcon.setContextMenu(contextMenu);

    var config = {
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y
    };

    try {
      config = require(mainWindowConfigPath);
    } catch (e) {
      startMaximized = true;
    }

    config.icon = __dirname + '/resources/icon.png';
    config.show = false;

    startMaximized = config.maximized || startMaximized;

    mainWindow = new BrowserWindow(config);
    mainWindow.loadUrl('file://' + __dirname + '/windows/main/index.html');

    trayIcon.on("clicked", function () {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        if (startMaximized) {
          mainWindow.maximize();
          startMaximized = false;
        }
      }
    });

    if (!trayMode) {
      mainWindow.show();
      if (startMaximized) {
        mainWindow.maximize();
        startMaximized = false;
      }
    }

    if (devMode) {
      //mainWindow.toggleDevTools();
    } else {
      mainWindow.setMenu(null);
    }

    mainWindow.setTitle("electro-commander");

    mainWindow.on("close", function close(event) {
      mainWindow.hide();
      saveConfig();
      event.preventDefault();
    });

    mainWindow.on('closed', exit);
  }

  process.on('exit', exit);

  function exit() {
    saveConfig();
    exec("taskkill /pid " + process.pid + " /f /t ");
  }

  function saveConfig() {
    var data = mainWindow.getBounds();
    data.maximized = mainWindow.isMaximized();
    fs.writeFileSync(mainWindowConfigPath, JSON.stringify(data, null, 2));
  }

})();