/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(InputProcessRun);

  InputProcessRun.$inject = ["$rootScope", "execute", "tabs"];

  function InputProcessRun($rootScope, execute, tabs) {
    $rootScope.submit = submit;

    function submit($event, tab) {
      if ($event.keyCode === 13) {
        var sourceTab = tab;
        var input = tab.input;
        var args = input.split(" ");

        args.shift();

        tab.input = "";

        if ($event.ctrlKey === true) {
          tab = tabs.new();
          tab.cwd = sourceTab.cwd;
        }

        execute(input, tab);
      }
    }
  }

})();