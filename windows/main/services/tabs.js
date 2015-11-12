/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").provider("tabs", tabsProvider);

  function tabsProvider() {

    var nameProviders = [];

    function registerNameProvider(provider, weight) {
      nameProviders.push({provider: provider, weight: weight || 0});
      nameProviders.sort(function (a, b) {
        return a.weight - b.weight;
      });
    }

    function getNameForTab(tab) {
      var out = "";

      for (var i = 0; i < nameProviders.length; i++) {
        var providerObj = nameProviders[i];
        var provided = providerObj.provider(tab);
        if (provided) {
          out = provided;
          break;
        }
      }

      return tab.name || out || tab.cwd;
    }

    tabsService.$inject = ["mainProcess", "debounce", "kill"];
    function tabsService(mainProcess, debounce, kill) {
      var tabs = getStoreage();

      tabs.new = newTab;
      tabs.remove = removeTab;
      tabs.save = debounce(save, 100);

      mainProcess.on("cycle", tabs.save);

      function newTab() {
        var tab = {
          cwd: process.cwd(),
          lines: [],
          history: [],
          child: null
        };

        tabs.push(tab);

        mainProcess.$emit("cycle");
        return tab;
      }

      function removeTab(tab) {
        var index = tabs.indexOf(tab);
        if (index !== -1) {
          tabs.splice(index, 1);
          if (tab.child) {
            kill(tab.child.pid);
          }
          mainProcess.$emit("cycle");
        }
        console.log("tabs.remove :: index: %s | tab: %o", index, tab);
      }

      function getStoreage() {
        try {
          return require(__dirname + "\\..\\conf\\tabs.json");
        } catch (e) {
          return [];
        }
      }

      function save() {
        tabs.forEach(function (tab) {
          tab.$name = getNameForTab(tab);
        });
        var toSave = [];
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          toSave.push({
            lines: tab.lines,
            history: tab.history,
            cwd: tab.cwd,
            name: tab.name,
            $name: tab.$name,
            bootstrap: tab.bootstrap
          });
        }
        fs.writeFileSync(__dirname + "\\..\\conf\\tabs.json", JSON.stringify(toSave, null, 2));
      }

      return tabs;
    }

    return {
      registerNameProvider: registerNameProvider,
      $get: tabsService
    };
  }

})();