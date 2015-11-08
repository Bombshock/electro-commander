/*global module*/
/*global require*/

"use strict";

var sprintf = require("sprintf-js").sprintf;

module.exports = function (args, stdout, stderr, tab) {
    console.log("args", arguments);
    if (args.length >= 2) {
        var key = args.shift();
        var value = args.join(" ");
        tab[key] = value;
    } else if (args.length === 1 && args[0] !== "?") {
        delete tab[args[0]];
    } else {
        for (var i = 0; i < module.exports.help.length; i++) {
            var helpLine = module.exports.help[i];
            stderr(helpLine);
        }
        stderr("\nKeys\n");
        stderr(sprintf("%-30s %s", "$var name [value]", "sets the name of the current Tab"));
        stderr(sprintf("%-30s %s", "$var bootstrap [value]", "sets the command, for the current tab, to be executed on bootstrap (Application start)"));
    }
    if (window.saveTabs) {
        window.saveTabs();
    }
};

module.exports.help = [
    sprintf("%-30s %s", "$var [key] [value]", "sets attribute `key` to `value`"),
    sprintf("%-30s %s", "$var [key]", "deletes attribute `key`"),
    sprintf("%-30s %s", "$var ?", "displays help")
];