/*global angular*/

(function () {
  'use strict';

  var EventEmitter = require('events');
  var util = require('util');

  angular.module("app").service("mainProcess", mainProcessService);

  mainProcessService.$inject = ["$timeout"];

  function mainProcessService($timeout) {
    var flags = {};

    util.inherits(MainProcess, EventEmitter);

    function MainProcess() {
      EventEmitter.call(this);
    }

    MainProcess.prototype.$emit = function () {
      var main = this;
      var args = Array.prototype.slice.call(arguments);
      $timeout(function () {
        main.emit.apply(main, args);
      });
    };

    MainProcess.prototype.toggle = function (flag) {
      flags[flag] = !flags[flag];
      console.log("MainProcess :: flag: %s => %s", flag, flags[flag]);
      this.$emit("flags." + flag, flags[flag]);
    };

    MainProcess.prototype.is = function (flag) {
      return flags[flag];
    };

    return new MainProcess();
  }

})();