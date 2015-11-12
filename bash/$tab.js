/*global angular*/

(function () {
  'use strict';

  var sprintf = require("sprintf-js").sprintf;

  angular.module("app").config($tabConfig);

  $tabConfig.$inject = ["bashProvider"];

  function $tabConfig(bash) {

    bash.register("$tab", $tab);

    function $tab(args, stdout, stderr, tab) {
      console.log("args", arguments);
      if (args.length >= 2) {
        var key = args.shift();
        tab[key] = args.join(" ");
      } else if (args.length === 1 && args[0] !== "?") {
        delete tab[args[0]];
      } else {
        for (var i = 0; i < bash.$tab.help.length; i++) {
          var helpLine = bash.$tab.help[i];
          stdout(helpLine);
        }
        stdout("\nKeys\n");
        stdout(sprintf("%-30s %s", "$tab name [value]", "sets the name of the current Tab"));
        stdout(sprintf("%-30s %s", "$tab bootstrap [value]", "sets the command, for the current tab, to be executed on bootstrap (Application start)"));
      }

      //noinspection JSUnresolvedVariable
      if (typeof window.saveTabs === "function") {
        //noinspection JSUnresolvedFunction
        window.saveTabs();
      }
    }

    $tab.help = [
      sprintf("%-30s %s", "$tab [key] [value]", "sets attribute `key` to `value`"),
      sprintf("%-30s %s", "$tab [key]", "deletes attribute `key`"),
      sprintf("%-30s %s", "$tab ?", "displays help")
    ];
  }

})();