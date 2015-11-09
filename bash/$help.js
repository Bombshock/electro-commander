/*global module*/
/*global require*/

(function () {
  "use strict";

  var sprintf = require("sprintf-js").sprintf;

  module.exports = function (args, stdout, stderr, tab) {

    var bash = require('include-all')({
      dirname: __dirname,
      filter: /(.*)\.js$/
    });

    stdout("[34mcustom commands:");

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

    stdout("\n");
    stdout("[34mgenereal stuff");
    stdout(" • " + "you can use your Mouse completely free as long as you hold down [CTRL]");

    stdout("\n");
    stdout("[34mcontrolls");
    stdout(" • " + sprintf("%-30s %s", "[alt]  + [left]", "previous tab"));
    stdout(" • " + sprintf("%-30s %s", "[alt]  + [right]", "next tab"));
    stdout(" • " + sprintf("%-30s %s", "[ctrl] + [d]", "close tab"));
    stdout(" • " + sprintf("%-30s %s", "[ctrl] + [c]", "kills process of active tab"));
    stdout(" • " + sprintf("%-30s %s", "[ctrl] hold down", "releases the cursor (free mouse)"));
    stdout(" • " + sprintf("%-30s %s", "[ctrl] up", "forces to focus the input"));
    stdout(" • " + sprintf("%-30s %s", "[tab]", "auto-complete - resolves paths based on CWD"));
    stdout(" • " + sprintf("%-30s %s", "[tab]  double tab", "executes `ls` command"));
  };

  module.exports.help = [
    sprintf("%-30s %s", "", "show this actual fucking help")
  ];
})();