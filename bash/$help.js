/*global angular*/

(function () {
  'use strict';

  var sprintf = require("sprintf-js").sprintf;
  require('colors');

  angular.module("app").config($helpConfig);

  $helpConfig.$inject = ["bashProvider"];

  function $helpConfig(bash) {

    bash.register("$help", $help);

    //noinspection JSUnusedLocalSymbols
    function $help(args, stdout) {

      var bash = require('include-all')({
        dirname: __dirname,
        filter: /(.*)\.js$/
      });

      stdout("custom commands:".blue);

      var line = "   ├── ";
      var lineEnd = "   └── ";

      for (var command in bash) {
        if (bash.hasOwnProperty(command)) {
          var script = bash[command];
          stdout(" • " + command);
          if (script.help) {
            if (script.help instanceof Array) {
              for (var i = 0; i < script.help.length; i++) {
                var helpLine = script.help[i];
                stdout((i + 1 < script.help.length ? line : lineEnd) + helpLine);
              }
            } else {
              stdout(script.help);
            }
          }
        }
      }

      stdout("");
      stdout("genereal stuff".blue);
      stdout(" • " + "you can use your Mouse completely free as long as you hold down [CTRL]");

      stdout("");
      stdout("controlls".blue);
      stdout(" • " + sprintf("%-30s %s", "[alt]  + [left]", "previous tab"));
      stdout(" • " + sprintf("%-30s %s", "[alt]  + [right]", "next tab"));
      stdout(" • " + sprintf("%-30s %s", "[ctrl] + [d]", "close tab"));
      stdout(" • " + sprintf("%-30s %s", "[ctrl] + [c]", "kills process of active tab"));
      stdout(" • " + sprintf("%-30s %s", "[ctrl] + [q]", "toggles free cursor (lets you select stuff and so on)"));
      stdout(" • " + sprintf("%-30s %s", "[tab]", "auto-complete - resolves paths based on CWD"));
    }

    $help.help = [
      sprintf("%-30s %s", "", "show this actual fucking help")
    ];
  }

})();