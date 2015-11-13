/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(HotkeyProcessRun);

  var currentWindow = require("remote").getCurrentWindow();

  HotkeyProcessRun.$inject = ["$timeout", "$rootScope", "kill", "tabs", "execute", "mainProcess"];

  function HotkeyProcessRun($timeout, $rootScope, kill, tabs, execute, mainProcess) {

    $rootScope.killTabChild = killTabChild;
    $rootScope.restartTabChild = restartTabChild;

    window.addEventListener("keyup", function ($event) {
      if (!$rootScope.activeModal) {
        globalKeyEvent($event);
      }
    });

    function globalKeyEvent($event) {
      var tab = $rootScope.activeTab;

      if (tab && ($event.keyCode === 99 || $event.keyCode === 67) && $event.ctrlKey && tab.child) { //ctrl-c
        $timeout(function () {
          killTabChild(tab);
        });
      }

      if ($event.altKey && $event.keyCode >= 48 && $event.keyCode <= 57) { //alt [0-9]
        var number = $event.keyCode - 49;
        if (number < 0) {
          number = 9;
        }
        if (number < tabs.length) {
          $timeout(function () {
            $rootScope.selectedIndex = number;
          });
        }
      }

      if ($event.altKey && $event.keyCode === 39) { //alt-right
        $timeout(function () {
          $rootScope.selectedIndex = $rootScope.selectedIndex < $rootScope.tabs.length - 1 ? $rootScope.selectedIndex + 1 : 0;
        });
      }

      if ($event.altKey && $event.keyCode === 37) { //alt-left
        $timeout(function () {
          $rootScope.selectedIndex = $rootScope.selectedIndex > 0 ? $rootScope.selectedIndex - 1 : $rootScope.tabs.length - 1;
        });
      }

      if ($event.ctrlKey && $event.keyCode === 68) { //ctrl-d
        $timeout(function () {
          tabs.remove(tab);
        });
      }

      if ($event.ctrlKey && $event.keyCode === 84) { //ctrl-t
        $timeout(function () {
          tabs.new();
        });
      }

      if ($event.ctrlKey && $event.keyCode === 81) { //ctrl-q
        $timeout(function () {
          mainProcess.toggle("cursorFree");
        });
      }

      if ($event.keyCode === 27) { //esc
        currentWindow.hide();
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