/*global require*/
/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").directive("ecTab", ecTabDirective);

  ecTabDirective.$inject = ["mainProcess"];

  function ecTabDirective(mainProcess) {
    return {
      restrict: 'A',
      link: function (scope) {
        var MAX_LINES = 500;

        scope.$watch("tab.cwd", function (cwd) {
          if (!scope.tab) {
            return;
          }

          if (scope.tab.cwdWatcher) {
            scope.tab.cwdWatcher.close();
          }

          scope.tab.cwdWatcher = fs.watch(cwd, {persistent: false, recursive: false}, function () {
            //console.log("change", arguments);
          });

          mainProcess.$emit("tab.cwd", cwd, scope.tab);
        });

        scope.$watchCollection("tab.lines", function (lines) {
          if (lines) {
            //noinspection JSUnresolvedVariable
            while (lines.length > MAX_LINES) {
              //noinspection JSUnresolvedFunction
              lines.shift();
            }
          }
        });
      }
    };
  }

})();