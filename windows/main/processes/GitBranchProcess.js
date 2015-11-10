/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(GitBranchProcess);

  GitBranchProcess.$inject = ["mainProcess", "$timeout"];

  function GitBranchProcess(mainProcess, $timeout) {
    mainProcess.on("cycle", gitBranchCycle);

    function gitBranchCycle(reason, activeTab) {
      if (reason === "cwd") {
        var gitFolder = activeTab.ls[activeTab.ls.indexOf(".git")];

        if (gitFolder) {
          require("child_process").exec("git branch", {
            cwd: activeTab.cwd
          }, function (error, stdout) {
            $timeout(function () {
              if (error) {
                delete activeTab.branch;
              } else {
                activeTab.branch = stdout.replace("*", "").trim();
              }
            });
          });
        } else {
          delete activeTab.branch;
        }
      }
    }
  }

})();