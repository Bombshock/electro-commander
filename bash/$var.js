/*global module*/
/*global require*/

"use strict";

module.exports = function (args, stdout, stderr, tab) {
    console.log("args", arguments);
    if (args.length >= 2) {
        var key = args.shift();
        var value = args.join(" ");
        tab[key] = value;
    } else if (args.length === 1) {
        delete tab[args[0]];
    } else {
        stderr("$var expects 2 arguments for setting");
        stderr("$var [key] [value]");
        stderr("$var expects 1 argument for unsetting");
        stderr("$var [key]");
    }
    window.saveTabs();
};