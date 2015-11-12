/*global angular*/
/*global require*/

(function () {
  'use strict';

  var grunt = require("grunt");

  angular.module("app").run(GruntProcess);
  GruntProcess.$inject = ["mainProcess"];
  function GruntProcess(mainProcess) {
    mainProcess.on("tab.cwd", gruntCycle);

    function gruntCycle(cwd, tab) {
      var gruntfilePath = cwd + "\\Gruntfile.js";
      try {
        require(gruntfilePath)(grunt);
        tab.grunt = grunt;
        console.log("tab.grunt", tab.grunt.task._tasks);
      } catch (ex) {
        delete tab.grunt;
      }
    }
  }

})();