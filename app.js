/**
 * User: abau
 * Date: 02.07.2015
 * Time: 10:50
 */

(function () {
    'use strict';

    var mainWindow;
    var app = require('app');
    var BrowserWindow = require('browser-window');
    var exec = require("child_process").execSync;

    app.on('ready', function () {
        var screen = require('screen');
        var displays = screen.getAllDisplays();
        var externalDisplay = null;
        for (var i in displays) {
            if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
                externalDisplay = displays[i];
                break;
            }
        }
        if (externalDisplay) {
            mainWindow = new BrowserWindow({
                width: externalDisplay.bounds.width,
                height: externalDisplay.bounds.height,
                x: externalDisplay.bounds.x,
                y: externalDisplay.bounds.y
            });
            mainWindow.loadUrl('file://' + __dirname + '/windows/main/index.html');
            mainWindow.maximize();
            //mainWindow.toggleDevTools();
            mainWindow.setMenu(null);
            mainWindow.on('close', exit);
            mainWindow.on('closed', exit);
        }
    });

    process.on('exit', exit);

    function exit(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        exec("taskkill /pid " + process.pid + " /f /t ");
    }

})();