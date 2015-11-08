/*global module*/
/*global require*/

"use strict";

module.exports = function (args, stdout, stderr, tab) {

    var bash = require('include-all')({
        dirname: __dirname,
        filter: /(.*)\.js$/
    });

    stdout("HELP :O");
    stdout("==========================");
    stdout("custom commands:");
    stdout("\n");

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
};

var sprintf = require("sprintf-js").sprintf;
module.exports.help = [
    sprintf("%-30s %s", "", "show this actual fucking help")
];