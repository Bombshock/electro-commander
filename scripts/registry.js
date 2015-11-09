/*global module*/
/*global require*/
/*global __dirname*/

"use strict";

var Q = require("q");
var Winreg = require('winreg');
var path = require("path");

module.exports = function () {
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

  var electron = "C:\\Users\\Alexander\\Desktop\\electron\\node_modules\\electron-prebuilt\\dist\\electron.exe";
  var main = path.resolve(__dirname, "../main.js");

  if (process.argv.length > 0) {
    var first = process.argv[0];
    if (first.indexOf("electron.exe") !== -1) {
      electron = first;
    }
  }

  ensure(regKey)
      .then(function () {
        return setPath(regKey, "", Winreg.REG_SZ, "Open with electro");
      })
      .then(function () {
        return setPath(regKey, "icon", Winreg.REG_SZ, electron);
      });

  ensure(regKeySub)
      .then(function () {
        return setPath(regKeySub, "", Winreg.REG_SZ, '"' + electron + '" "' + main + '" "--path" "%V"');
      });

  ensure(regKeyDir)
      .then(function () {
        return setPath(regKeyDir, "", Winreg.REG_SZ, "Open with electro");
      })
      .then(function () {
        return setPath(regKeyDir, "icon", Winreg.REG_SZ, electron);
      });

  ensure(regKeyDirSub)
      .then(function () {
        return setPath(regKeyDirSub, "", Winreg.REG_SZ, '"' + electron + '" "' + main + '" "--path" "%V"');
      });

  function ensure(regKey) {
    return values(regKey)
        .catch(function () {
          return create(regKey);
        })
        .then(function () {
          return values(regKey);
        })
  }

  function values(regKey) {
    return Q.npost(regKey, "values");
  }

  function create(regKey) {
    return Q.npost(regKey, "create");
  }

  function setPath(regKey, name, type, value) {
    return Q.npost(regKey, "set", [name, type, value]);
  }
};

module.exports();