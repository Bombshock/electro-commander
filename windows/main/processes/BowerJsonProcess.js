/*global angular*/
/*global require*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").config(BowerJsonConfig);
  BowerJsonConfig.$inject = ["tabsProvider"];
  function BowerJsonConfig(tabsProvider) {
    tabsProvider.registerNameProvider(function (tab) {
      if (tab.packageJson) {
        return tab.bowerJson.name;
      }
    }, 200);
  }

  angular.module("app").run(BowerJsonProcess);
  BowerJsonProcess.$inject = ["$timeout", "mainProcess", "debounce"];
  function BowerJsonProcess($timeout, mainProcess, debounce) {
    mainProcess.on("tab.cwd", bowerJsonCycle);

    function bowerJsonCycle(cwd, tab) {
      var debouncedRead = debounce(read, 50);
      read();
      tab.cwdWatcher.on("change", function (event, file) {
        if (file === null || file === "bower.json") {
          debouncedRead();
        }
      });
      function read() {
        $timeout(function () {
          var path = cwd + "\\bower.json";
          try {
            console.log("read", path);
            tab.bowerJson = JSON.parse(fs.readFileSync(path, "utf-8"));
          } catch (ex) {
            delete tab.bowerJson;
          }
        });
      }
    }
  }

})();