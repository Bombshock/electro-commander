/*global angular*/

(function () {
  'use strict';

  angular.module("app").config(cdConfig);

  cdConfig.$inject = ["bashProvider"];

  function cdConfig(bash) {
    //noinspection JSUnusedLocalSymbols
    function cd(args, stdout, stderr, tab) {
      console.log("args[0]", args[0]);
      if (args.length > 0) {
        process.chdir(tab.cwd);
        process.chdir(args[0]);
        tab.cwd = process.cwd();
      }
    }

    cd.help = [
      require("sprintf-js").sprintf("%-30s %s", "cd [path]", "navigates to the path, sets the current working directory of the current tab.")
    ];

    bash.register("cd", cd);
  }


})();