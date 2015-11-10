/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").service("tabs", tabsService);

  tabsService.$inject = ["mainProcess", "debounce", "kill"];

  function tabsService(mainProcess, debounce, kill) {
    var tabs = getStoreage();

    tabs.new = function newTab() {
      var tab = {
        cwd: process.cwd(),
        lines: [],
        history: [],
        child: null
      };

      tabs.push(tab);

      mainProcess.$emit("cycle");
      return tab;
    };

    tabs.remove = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      if (index !== -1) {
        tabs.splice(index, 1);
        if (tab.child) {
          kill(tab.child.pid);
        }
        mainProcess.$emit("cycle");
      }
    };

    tabs.save = debounce(save, 100);
    mainProcess.on("cycle", tabs.save);

    function getStoreage() {
      try {
        return require(__dirname + "/../conf/tabs.json");
      } catch (e) {
        return [];
      }
    }

    function save() {
      var toSave = [];
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        toSave.push({
          lines: tab.lines,
          history: tab.history,
          cwd: tab.cwd,
          name: tab.name,
          bootstrap: tab.bootstrap
        });
      }
      fs.writeFileSync(__dirname + "/../conf/tabs.json", JSON.stringify(toSave, null, 2));
    }

    return tabs;
  }

})();