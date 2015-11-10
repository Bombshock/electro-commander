/*global angular*/

(function () {
  'use strict';

  angular.module("app").run(tabsProcessRun);

  tabsProcessRun.$inject = ["execute", "CMDMessage", "tabs"];

  function tabsProcessRun(execute, CMDMessage, tabs) {
    if (tabs.length === 0) {
      execute("$help", tabs.new());
    } else {
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        for (var j = 0; j < tab.lines.length; j++) {
          var line = tab.lines[j];
          tab.lines[j] = new CMDMessage(line.message, line.type);
        }
        if (tab.bootstrap) {
          execute(tab.bootstrap, tab);
        }
      }
    }
  }

})();