/*global angular*/

(function () {
  'use strict';

  var currentWindow = require("remote").getCurrentWindow();

  angular.module("app").service("argvHandler", argvHandlerService);

  argvHandlerService.$inject = ["$timeout", "$rootScope", "tabs"];

  function argvHandlerService($timeout, $rootScope, tabs) {
    return handleArgv;

    function handleArgv(argv) {
      var pathIndex = argv.indexOf("--path");
      if (pathIndex !== -1 && pathIndex + 1 < argv.length) {
        currentWindow.focus();
        $timeout(function (){
          openPath(argv[pathIndex + 1]);
          $timeout(function (){
              $rootScope.globalInput.focus();
          })
        }, 300);
      }
    }

    function openPath(pathToOpen) {
      $timeout(function () {
        var found = false;
        for (var h = 0; h < tabs.length; h++) {
          var __tab = tabs[h];
          if (__tab.cwd.toLowerCase() === pathToOpen.toLowerCase()) {
            $rootScope.activeTab = __tab;
            $rootScope.selectedIndex = h;
            found = true;
          }
        }
        if (!found) {
          process.chdir(pathToOpen);
          tabs.new();
        }
      });
    }
  }

})();