/*global angular*/

(function () {
  'use strict';

  var child_process = require("child_process");
  var Q = require("q");

  angular.module("app").service("kill", killService);

  killService.$inject = [];

  function killService() {
    return function kill(pid) {
      return Q.npost(child_process, "exec", ["taskkill /pid " + pid + " /f /t "]);
    };
  }

})();