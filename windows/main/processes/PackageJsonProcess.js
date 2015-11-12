/*global angular*/
/*global require*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").config(PackageJsonConfig);
  PackageJsonConfig.$inject = ["tabsProvider"];
  function PackageJsonConfig(tabsProvider) {
    tabsProvider.registerNameProvider(function (tab) {
      if (tab.packageJson) {
        return tab.packageJson.name;
      }
    }, 100);
  }

  angular.module("app").run(PackageJsonProcess);
  PackageJsonProcess.$inject = ["$timeout", "mainProcess", "debounce"];
  function PackageJsonProcess($timeout, mainProcess, debounce) {
    mainProcess.on("tab.cwd", packageJsonCycle);

    function packageJsonCycle(cwd, tab) {
      var debouncedRead = debounce(read, 50);
      read();
      tab.cwdWatcher.on("change", function (event, file) {
        if (file === null || file === "package.json") {
          debouncedRead();
        }
      });
      function read() {
        $timeout(function () {
          var path = cwd + "\\package.json";
          try {
            console.log("read", path);
            tab.packageJson = JSON.parse(fs.readFileSync(path, "utf-8"));
          } catch (ex) {
            delete tab.packageJson;
          }
        });
      }
    }
  }

})();