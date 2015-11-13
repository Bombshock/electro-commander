/*global angular*/

(function () {
  'use strict';

  var currentWindow = require("remote").getCurrentWindow();

  angular.module("app").run(WindowTitleProcess);
  WindowTitleProcess.$inject = ["mainProcess"];
  function WindowTitleProcess(mainProcess) {
    mainProcess.on("cycle", windowTitleCycle);

    function windowTitleCycle(reason, activeTab) {
      if (reason === "cwd") {
        if (activeTab.cwd) {
          currentWindow.setTitle("electro-commander > " + activeTab.cwd);
        } else {
          currentWindow.setTitle("electro-commander");
        }
      }
    }
  }

})();