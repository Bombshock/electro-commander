/*global module*/

'use strict';

module.exports = function (args, stdout, stderr, tab) {
  if (args.length > 0) {
    process.chdir(tab.cwd);
    process.chdir(args[0]);
    tab.cwd = process.cwd();
  }
};