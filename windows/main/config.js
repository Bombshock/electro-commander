/*global module*/

'use strict';

var fs = require("fs");

try {
  module.exports = require(__dirname + "\\conf\\config.json");
} catch (ex) {
  module.exports = {};
}

module.exports.save = function () {
  fs.writeFileSync(__dirname + "\\conf\\config.json", JSON.stringify(module.exports, null, 2));
};