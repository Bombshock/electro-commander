/*global angular*/

(function () {
  'use strict';

  var sprintf = require("sprintf-js").sprintf;

  angular.module("app").config(clsConfig);

  clsConfig.$inject = ["bashProvider"];

  function clsConfig(bash) {
    //noinspection JSUnusedLocalSymbols
    function cls(args, stdout, stderr, tab) {
      tab.lines = [];
      tab.history = [];
    }

    cls.help = [
      sprintf("%-30s %s", "cls", "clears the screen")
    ];

    bash.register("cls", cls);
  }

})();