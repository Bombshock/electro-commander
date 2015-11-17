/*global angular*/

(function () {
  'use strict';

  var Q = require("q");
  var Winreg = require('winreg');
  var path = require("path");

  var electron = path.resolve(__dirname, "../../../node_modules/electron-prebuilt/dist/electron.exe");
  var main = path.resolve(__dirname, "../../../main.js");
  var ico = path.resolve(__dirname, "../../../resources/icon.ico");

  var regKey = new Winreg({
    hive: Winreg.HKCU,
    key: '\\SOFTWARE\\Classes\\Directory\\Background\\shell\\electroCommander'
  });
  var regKeySub = new Winreg({
    hive: Winreg.HKCU,
    key: '\\SOFTWARE\\Classes\\Directory\\Background\\shell\\electroCommander\\command'
  });
  var regKeyDir = new Winreg({
    hive: Winreg.HKCU,
    key: '\\SOFTWARE\\Classes\\Directory\\shell\\electroCommander'
  });
  var regKeyDirSub = new Winreg({
    hive: Winreg.HKCU,
    key: '\\SOFTWARE\\Classes\\Directory\\shell\\electroCommander\\command'
  });
  var regKeyAutostart = new Winreg({
    hive: Winreg.HKCU,
    key: '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\run'
  });

  function addContextMenu() {
    ensure(regKey)
      .then(function () {
        return setPath(regKey, "", Winreg.REG_SZ, "Open with electro");
      })
      .then(function () {
        return setPath(regKey, "icon", Winreg.REG_SZ, ico);
      })
      .catch(console.error);

    ensure(regKeySub)
      .then(function () {
        return setPath(regKeySub, "", Winreg.REG_SZ, '"' + electron + '" "' + main + '" "--path" "%V"');
      })
      .catch(console.error);

    ensure(regKeyDir)
      .then(function () {
        return setPath(regKeyDir, "", Winreg.REG_SZ, "Open with electro");
      })
      .then(function () {
        return setPath(regKeyDir, "icon", Winreg.REG_SZ, ico);
      })
      .catch(console.error);

    ensure(regKeyDirSub)
      .then(function () {
        return setPath(regKeyDirSub, "", Winreg.REG_SZ, '"' + electron + '" "' + main + '" "--path" "%V"');
      })
      .catch(console.error);
  }

  function addAutostart() {
    ensure(regKeyAutostart)
      .then(function () {
        return setPath(regKeyAutostart, "Electro Commander", Winreg.REG_SZ, '"' + electron + '" "' + main + '" "--tray"');
      })
      .catch(console.error);
  }

  function removeAutostart() {
    remove(regKeyAutostart, "Electro Commander")
      .catch(console.error);
  }

  function eraseContextMenu() {
    erase(regKeySub)
      .then(function () {
        return erase(regKey);
      })
      .then(console.log)
      .catch(console.error);

    erase(regKeyDirSub)
      .then(function () {
        return erase(regKeyDir);
      })
      .then(console.log)
      .catch(console.error);
  }

  function ensure(regKey) {
    return values(regKey)
      .catch(function () {
        return create(regKey);
      })
      .then(function () {
        return values(regKey);
      });
  }

  function values(regKey) {
    return Q.npost(regKey, "values");
  }

  function create(regKey) {
    return Q.npost(regKey, "create");
  }

  function remove(regKey, name) {
    return Q.npost(regKey, "remove", [name]);
  }

  function erase(regKey) {
    return Q.npost(regKey, "erase");
  }

  function setPath(regKey, name, type, value) {
    return Q.npost(regKey, "set", [name, type, value]);
  }

  angular.module("app").service("windowsRegistry", windowsRegistryService);
  windowsRegistryService.$inject = [];
  function windowsRegistryService() {
    return {
      addContextMenu: addContextMenu,
      addAutostart: addAutostart,
      removeAutostart: removeAutostart,
      eraseContextMenu: eraseContextMenu
    };
  }

})();