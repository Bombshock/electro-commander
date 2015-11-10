/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(PackageJsonProcess);

  PackageJsonProcess.$inject = ["mainProcess"];

  function PackageJsonProcess(mainProcess) {
    mainProcess.on("cycle", packageJsonCycle);

    function packageJsonCycle(reason, activeTab) {
      if (reason === "cwd") {
        var packageJson = activeTab.ls[activeTab.ls.indexOf("package.json")];

        if (packageJson) {
          activeTab.packageJson = require(activeTab.cwd + "/" + packageJson);
        } else {
          delete activeTab.packageJson;
        }
      }
    }
  }

})();