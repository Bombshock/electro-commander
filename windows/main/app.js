/*global angular*/

(function () {
    "use strict";

    var Q = require("q");
    var fs = require("fs");
    var colorSet = require(__dirname + "/colors.json");

    angular.module("app", ["ngMaterial"]);

    angular.module("app").config([
        "$mdThemingProvider",
        function ($mdThemingProvider) {

            // add Orange to the color palette
            var orangeMap = $mdThemingProvider.extendPalette('orange', {
                '800': 'FFA300'
            });
            $mdThemingProvider.definePalette('orange', orangeMap);

            //black background color
            var black = $mdThemingProvider.extendPalette('grey', {
                'A100': '333333'
            });
            $mdThemingProvider.definePalette('black', black);

            // Default Theme
            $mdThemingProvider.theme('default')
                .accentPalette('grey', {
                    'default': '800'
                })
                .primaryPalette('orange', {
                    'default': '800'
                });

            // Dark Theme
            $mdThemingProvider.theme('darkTheme')
                .dark()
                .accentPalette('grey', {
                    'default': '200'
                })
                .primaryPalette('orange', {
                    'default': '800'
                })
                .backgroundPalette('black');

            $mdThemingProvider.setDefaultTheme('darkTheme');
        }
    ]);

    angular.module("app").controller("AppController", [
        "$scope",
        "$window",
        "$timeout",
        "$sce",
        "bash",
        function ($scope, $window, $timeout, $sce, bash) {

            var remote = require("remote");
            var utf8 = require('utf8');
            var storage = localStorage || {};
            var originatorEv;

            var MAX_LINES = 250;

            process.chdir(process.env.CWD || process.env.USERPROFILE);

            $scope.openMenu = function ($mdOpenMenu, ev) {
                originatorEv = ev;
                $mdOpenMenu(ev);
            };

            $scope.input = "";
            $scope.submit = submit;
            $scope.newTab = newTab;
            $scope.removeTab = removeTab;
            $scope.execute = execute;
            $scope.restartActiveTabChild = restartActiveTabChild;
            $scope.killActiveTabChild = killActiveTabChild;
            $scope.remote = remote;
            $scope.process = process;
            $scope.currentWindow = remote.getCurrentWindow();
            $scope.selectedIndex = storage.selectedIndex || 0;

            $scope.lines = [];
            $scope.history = [];

            $scope.tabs = storage.tabs ? JSON.parse(storage.tabs) : [];

            $scope.$watch("selectedIndex", function (selectedIndex) {
                storage.selectedIndex = selectedIndex;
                $scope.activeTab = $scope.tabs[selectedIndex];
            });

            $scope.$watchCollection("activeTab.lines", function (lines) {
                while (lines.length > MAX_LINES) {
                    lines.shift();
                }
                saveTabs();
            });

            $scope.$watchCollection("activeTab.cwd", function (cwd) {
                var files = fs.readdirSync(cwd);
                var packageJSON = files[files.indexOf("package.json")];
                process.chdir(cwd);
                $scope.packageJSON = packageJSON ? require(cwd + "/" + packageJSON) : false;
                console.log("$scope.packageJSON", $scope.packageJSON);
            });

            console.log("$scope.tabs", $scope.tabs);
            console.log("process", process);
            console.log("$scope.currentWindow", $scope.currentWindow);

            if ($scope.tabs.length === 0) {
                execute("$help", newTab());
            } else {
                for (var i = 0; i < $scope.tabs.length; i++) {
                    var tab = $scope.tabs[i];
                    for (var j = 0; j < tab.lines.length; j++) {
                        var line = tab.lines[j];
                        tab.lines[j] = new CMDMessage(line.message, line.type);
                    }
                    if (tab.bootstrap) {
                        execute(tab.bootstrap, tab);
                    }
                }
            }

            window.saveTabs = saveTabs;
            window.addEventListener("keyup", function ($event) {
                $timeout(function () {
                    globalKeyEvent($event);
                })
            });

            function removeTab(tab) {
                var index = $scope.tabs.indexOf(tab);
                $scope.tabs.splice(index, 1);
                if ($scope.tabs.length === 0) {
                    execute("$help", newTab());
                }
                saveTabs();
            }

            function globalKeyEvent($event) {
                var tab = $scope.tabs[$scope.selectedIndex];

                if (tab && ($event.keyCode === 99 || $event.keyCode === 67) && $event.ctrlKey && tab.child) { //ctrl-ct
                    killActiveTabChild();
                }

                if ($event.altKey && $event.keyCode === 39) { //alt-right
                    $scope.selectedIndex = $scope.selectedIndex < $scope.tabs.length - 1 ? $scope.selectedIndex + 1 : 0;
                }

                if ($event.altKey && $event.keyCode === 37) { //alt-left
                    $scope.selectedIndex = $scope.selectedIndex > 0 ? $scope.selectedIndex - 1 : $scope.tabs.length - 1;
                }

                if ($event.ctrlKey && $event.keyCode === 68) { //ctrl-d
                    removeTab($scope.activeTab);
                }
            }

            function restartActiveTabChild() {
                var tab = $scope.activeTab;
                var oldChild = tab.child;
                if (oldChild) {
                    killChild(oldChild.pid);
                    oldChild.on("close", function () {
                        console.log("execute", oldChild.command, tab, oldChild.cwd);
                        tab.lines = [];
                        execute(oldChild.command, tab, oldChild.cwd);
                    })
                }
            }

            function killActiveTabChild() {
                var tab = $scope.activeTab;
                var child = tab.child;
                tab.child = null;
                if (child) {
                    tab.lines.push(new CMDMessage(" -- Task was killed by Ctrl-C"));
                    killChild(child.pid);
                }
            }

            function getChildren(pid) {
                var all = require("child_process").execSync("wmic process get Caption,ParentProcessId,ProcessId").toString();
                var split = all.split("\n");
                var map = [];
                split.shift();
                split.shift();
                split.pop();
                split.pop();
                split.forEach(function (line) {
                    var splittedLine = line.split(" ");
                    splittedLine.shift();
                    splittedLine = splittedLine.filter(function (arg) {
                        return arg !== "";
                    });
                    splittedLine = splittedLine.map(function (arg) {
                        return parseInt(arg);
                    });
                    splittedLine.pop();
                    map.push(splittedLine);
                });

                return getChildren(pid);

                function getChildren(pid) {
                    var out = [];
                    for (var i = 0; i < map.length; i++) {
                        var obj = map[i];
                        if (obj[0] === pid) {
                            out.push(obj[1]);
                            out = out.concat(getChildren(obj[1]));
                        }
                    }
                    return out;
                }

            }

            function killChild(pid) {
                var pids = getChildren(pid).concat(pid);
                for (var i = 0; i < pids.length; i++) {
                    process.kill(pids[i]);
                }
            }

            function newTab() {
                var tab = {
                    cwd: process.cwd(),
                    lines: [],
                    history: [],
                    child: null
                };

                $scope.tabs.push(tab);
                $scope.selectedIndex = $scope.tabs.length - 1;

                $timeout(function () {
                    saveTabs();
                });

                return tab;
            }

            function saveTabs() {
                var toSave = [];
                for (var i = 0; i < $scope.tabs.length; i++) {
                    var tab = $scope.tabs[i];
                    toSave.push({
                        lines: tab.lines,
                        history: tab.history,
                        cwd: tab.cwd,
                        name: tab.name,
                        bootstrap: tab.bootstrap
                    })
                }
                storage.tabs = JSON.stringify(toSave);
            }

            function spawn() {
                console.log('spawn called');
                console.log(arguments);
                return require("child_process").spawn.apply(this, arguments);
            }

            function exec(cmd) {
                var child_process = require("child_process");
                return Q.Promise(function (resolve, reject) {
                    child_process.exec(cmd, callback);
                    function callback(error, stdout, stderr) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(stdout);
                        }
                        console.log("stderr", stderr);
                    }
                });
            }

            function execute(line, tab, cwd) {
                var input = line;
                var args = input.split(" ");
                var bin = args.shift();

                cwd = cwd || tab.cwd;

                console.log("submit", input);

                if (tab.history[tab.history.length - 1] !== input) {
                    tab.history.push(input);
                }

                tab.lines.push(new CMDMessage(cwd + "> " + input, CMDMessage.TYPE_COMMAND));
                tab.historyIndex = null;

                if (!line) {
                    return;
                }

                console.log("bin", bin);
                console.log("args", args);

                if (bin in bash) {
                    Q.when(bash[bin].apply(bash[bin], [args, stdout, stderr, tab]))
                        .finally(function () {
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                } else {
                    args.unshift(bin);

                    // cmd "/s", "/c"
                    // PowerShell "-NoProfile", "-NonInteractive", "-NoLogo", "-ExecutionPolicy", "Bypass", "-Command"
                    tab.child = spawn("cmd", ["/s", "/c"].concat(args), {
                        cwd: cwd
                    });

                    tab.child.command = input;
                    tab.child.cwd = tab.cwd;

                    tab.child.stdout.on('data', stdout);

                    tab.child.stderr.on('data', stderr);

                    tab.child.on('close', function (code) {
                        console.log('child process exited with code ' + code);
                        tab.child = null;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                }

                saveTabs();

                function stdout(msg) {
                    if (msg instanceof Buffer) {
                        for (var i = 0; i < msg.length; i++) {
                            var char = msg[i];
                            switch (char) {
                                case 12:
                                    tab.lines = [];
                                    msg = "";
                                    break;
                            }
                            if (char < 32) {
                                console.log("char", char);
                            }
                        }
                    }

                    msg = msg.toString();

                    if (msg.length > 0) {
                        tab.lines.push(new CMDMessage(msg));
                    }

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                    saveTabs();
                }

                function stderr(msg) {
                    if (msg instanceof Buffer) {
                        msg = msg.asciiSlice();
                    } else {
                        msg = msg.stack ? msg.stack : msg.toString();
                    }

                    console.error(msg);
                    tab.lines.push(new CMDMessage(msg, CMDMessage.TYPE_ERROR));

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                    saveTabs();
                }
            }

            function submit($event, tab) {
                if ($event.keyCode === 13) {
                    var input = tab.input;
                    var args = input.split(" ");

                    args.shift();

                    tab.input = "";

                    if ($event.ctrlKey === true) {
                        var sourceTab = tab;
                        tab = newTab();
                        tab.cwd = sourceTab.cwd;
                    }

                    execute(input, tab);
                }
            }

            function CMDMessage(message, type) {
                this.message = message || '';
                this.type = type || CMDMessage.TYPE_DEFAULT;
            }

            CMDMessage.TYPE_ERROR = 'error';
            CMDMessage.TYPE_DEFAULT = 'default';
            CMDMessage.TYPE_COMMAND = 'command';

            CMDMessage.prototype.toString = function () {
                var open = 0;
                var replaced = this.message.replace(/(\[\d+m)/ig, function (int) {
                    int = int.replace("[", "");
                    int = parseInt(int);
                    var out = "";
                    if (int === 0) {
                        for (var i = 0; i < open; i++) {
                            out += "</span>";
                        }
                        open = 0;
                    } else {
                        open++;
                        out += "<span style=\"" + colorSet[int] + "\">"
                    }
                    return out;
                });

                for (var i = 0; i < open; i++) {
                    replaced += "</span>";
                }

                return $sce.trustAsHtml(replaced);
            };
        }
    ]);

    angular.module("app").service("bash", [
        function () {
            return require('include-all')({
                dirname: __dirname + '/../../bash',
                filter: /(.*)\.js$/
            });
        }
    ]);

})();