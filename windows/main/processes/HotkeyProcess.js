/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(HotkeyProcessRun);

  HotkeyProcessRun.$inject = ["$timeout", "$rootScope", "kill", "tabs", "execute"];

  function HotkeyProcessRun($timeout, $rootScope, kill, tabs, execute) {

    $rootScope.killTabChild = killTabChild;
    $rootScope.restartTabChild = restartTabChild;

    window.addEventListener("keyup", function ($event) {
      $timeout(function () {
        globalKeyEvent($event);
      });
    });

    function globalKeyEvent($event) {
      var tab = $rootScope.activeTab;

      if (tab && ($event.keyCode === 99 || $event.keyCode === 67) && $event.ctrlKey && tab.child) { //ctrl-c
        killTabChild(tab);
      }

      if ($event.altKey && $event.keyCode === 39) { //alt-right
        $rootScope.selectedIndex = $rootScope.selectedIndex < $rootScope.tabs.length - 1 ? $rootScope.selectedIndex + 1 : 0;
      }

      if ($event.altKey && $event.keyCode === 37) { //alt-left
        $rootScope.selectedIndex = $rootScope.selectedIndex > 0 ? $rootScope.selectedIndex - 1 : $rootScope.tabs.length - 1;
      }

      if ($event.ctrlKey && $event.keyCode === 68) { //ctrl-d
        tabs.remove(tab);
      }

      if ($event.ctrlKey && $event.keyCode === 78) { //ctrl-n
        tabs.new();
      }
    }

    function killTabChild(tab) {
      var child = tab.child;
      if (child) {
        tab.child = null;
        kill(child.pid);
      }
    }

    function restartTabChild(tab) {
      var oldChild = tab.child;
      if (oldChild) {
        oldChild.on("close", function () {
          console.log("execute", oldChild.command, tab, oldChild.cwd);
          tab.lines = [];
          execute(oldChild.command, tab, oldChild.cwd);
        });
        kill(oldChild.pid);
      }
    }
  }

})();