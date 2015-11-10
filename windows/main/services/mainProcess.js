/*global angular*/

(function () {
  'use strict';

  var EventEmitter = require('events');
  var util = require('util');

  angular.module("app").service("mainProcess", mainProcessService);

  mainProcessService.$inject = ["$timeout"];

  function mainProcessService($timeout) {
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

    return new MainProcess();
  }

})();