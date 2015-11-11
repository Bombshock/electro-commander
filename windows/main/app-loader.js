/*global module*/

'use strict';

module.exports = function (document) {
  loadFolder("services", document);
  loadFolder("processes", document);
  loadFolder("directives", document);
};

function loadFolder(folder, document) {
  var _folder = require('require-all')({
    dirname: __dirname + '/' + folder,
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: false
  });

  setTimeout(function () {
    for (var file in _folder) {
      if (_folder.hasOwnProperty(file)) {
        var path = __dirname + '\\' + folder + '\\' + file + '.js';
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", path);
        document.body.appendChild(fileref);
      }
    }
  }, 0);
}