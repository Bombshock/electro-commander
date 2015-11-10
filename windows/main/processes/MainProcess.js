/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").run(MainProcessRun);

  MainProcessRun.$inject = ["$rootScope", "mainProcess", "debounce"];

  function MainProcessRun($rootScope, mainProcess, debounce) {
    var cycle = debounce(function cycleDebounced() {
      if ($rootScope.activeTab) {
        var cwd = $rootScope.activeTab.cwd;
        $rootScope.activeTab.ls = fs.readdirSync(cwd);
        process.chdir(cwd);
        mainProcess.$emit("cycle", "cwd", $rootScope.activeTab);
      }
    }, 30);

    $rootScope.$watch("activeTab", cycle);
    $rootScope.$watch("activeTab.cwd", cycle);
  }

})();