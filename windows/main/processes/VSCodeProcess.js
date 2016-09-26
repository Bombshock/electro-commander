/*global angular*/
/*global require*/

(function () {
  'use strict';

  var exec = require("child_process").execSync;
  var isWin = require('os').platform().indexOf('win') > -1;
  var where = isWin ? 'where' : 'whereis';
  var hasCode = false;

  try {
    var result = exec(where + " code", { stdio: ["ignore", "pipe", "ignore"] }).toString();
    if (result) {
      hasCode = true;
    }
  } catch (e) {
    hasCode = false;
  }

  angular.module("app").run(VSCodeProcess);

  VSCodeProcess.$inject = ["$rootScope"];

  function VSCodeProcess($rootScope) {
    $rootScope.hasVSCode = hasCode;
  }

})();