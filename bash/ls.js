/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");
  var Q = require("q");
  var sprintf = require("sprintf-js").sprintf;
  var moment = require("moment");

  angular.module("app").config(lsConfig);

  lsConfig.$inject = ["bashProvider"];

  function lsConfig(bash) {
    bash.register("ls", ls);

    ls.help = [
      sprintf("%-30s %s", "ls [path]", "lists all files and folders in current working directory OR [path] if given.")
    ];

    function ls(args, stdout, stderr) {
      var cwd = process.cwd();

      console.log("LS ::", arguments);

      args = args.filter(function (arg) {
        return !!arg.trim();
      });

      if (args.length > 0) {
        cwd = args[0];
      }

      return Q.ninvoke(fs, "readdir", cwd)
        .then(function (items) {
          //items.unshift("..");
          //items.unshift(".");

          for (var i = 0; i < items.length; i++) {
            var filename = items[i];
            try {
              var path = fs.realpathSync(cwd + "/" + filename).replace(/\\/gi, "/");
              var stats = fs.lstatSync(path);
              //noinspection JSUnresolvedFunction
              stdout(sprintf(
                "%17s  %3s  %9s %s",
                moment(stats.mtime).format("DD.MM.YYYY  HH:mm"),
                stats.isDirectory() ? "DIR" : "",
                stats.isDirectory() ? "" : humanFileSize(stats.size, true),
                filename
              ));
            } catch (e) {
              stderr(sprintf(
                "%-17s  %3s  %9s %s",
                "can't read",
                "",
                "",
                filename
              ));
            }
          }
        })
        .catch(stderr);
    }

    function humanFileSize(bytes, si) {
      var thresh = si ? 1000 : 1024;
      if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
      }
      var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      var u = -1;
      do {
        bytes /= thresh;
        ++u;
      } while (Math.abs(bytes) >= thresh && u < units.length - 1);
      return bytes.toFixed(1) + ' ' + units[u];
    }
  }

})();
