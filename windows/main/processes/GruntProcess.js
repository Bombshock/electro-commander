/*global angular*/
/*global require*/

(function () {
  'use strict';

  var grunt = require("grunt");

  angular.module("app").run(GruntProcess);
  GruntProcess.$inject = ["mainProcess", "CMDMessage"];
  function GruntProcess(mainProcess, CMDMessage) {
    mainProcess.on("tab.cwd", gruntCycle);

    function gruntCycle(cwd, tab) {
      var gruntfilePath = cwd + "\\Gruntfile.js";
      try {
        var gruntFile = require(gruntfilePath);
        try {
          gruntFile(grunt);
          tab.grunt = grunt;
          console.log("tab.grunt", tab.grunt.task._tasks);
        } catch (gruntEx) {
          console.error(gruntEx);
        }
      } catch (ex) {
        delete tab.grunt;
      }
    }
  }

})();