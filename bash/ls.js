/*global module*/

'use strict';

var fs = require("fs");
var Q = require("q");
var sprintf = require("sprintf-js").sprintf;
var moment = require("moment");

module.exports = function (args, stdout, stderr) {
    var cwd = process.cwd();

    if (args.length > 0) {
        cwd = args[args.length - 1];
    }

    return Q.ninvoke(fs, "readdir", cwd)
        .then(function (items) {
            items.unshift("..");
            items.unshift(".");

            for (var i = 0; i < items.length; i++) {
                var filename = items[i];
                try {
                    var path = fs.realpathSync(cwd + "/" + filename).replace(/\\/gi, "/");
                    var stats = fs.lstatSync(path);
                    stdout(sprintf(
                        "%17s  %3s  %9s %s",
                        moment(stats.mtime).format("DD.MM.YYYY  HH:mm"),
                        stats.isDirectory() ? "DIR" : "",
                        stats.isDirectory() ? "" : humanFileSize(stats.size, true),
                        filename
                    ))
                } catch (e) {
                    stderr(sprintf(
                        "%-17s  %3s  %9s %s",
                        "can't read",
                        "",
                        "",
                        filename
                    ))
                }
            }
        })
        .catch(stderr);
};

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}