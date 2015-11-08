/*global module*/

'use strict';

module.exports = function (args, stdout, stderr, tab) {
  if (args.length > 0) {
    process.chdir(tab.cwd);
    process.chdir(args[0]);
    tab.cwd = process.cwd();
  }
};

module.exports.help = [
  require("sprintf-js").sprintf("%-30s %s", "cd [path]", "navigates to the path, sets the current working directory of the current tab.")
];