/*global require*/
/*global console*/
/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");
  var path = require("path");
  var fsCache = {};

  angular.module("app").directive("tabInput", inputDirective);

  inputDirective.$inject = ["$timeout", "$rootScope", "mainProcess"];

  function inputDirective($timeout, $rootScope, mainProcess) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var tab = scope.$eval("activeTab");
        var nativeInput = element[0];

        scope.$root.globalInput = element;

        $timeout(function () {
          globalFocus();
        }, 100);

        element.on("blur", globalFocus);
        scope.$watch(globalFocus);

        $rootScope.$watch("activeModal", globalBlurCondition);
        mainProcess.on("flags.cursorFree", globalBlurCondition);

        scope.$watch("activeTab", function (activeTab) {
          if (activeTab) {
            tab = activeTab;
            tab.historyIndex = null;
          }
        });

        scope.$watch("activeTab.input", function (input) {
          if (!input) {
            fsCache = {};
          }
        });

        function globalBlurCondition(condition) {
          if (condition && nativeInput === document.activeElement) {
            element.blur();
          }
        }

        function globalFocus() {
          if (!$rootScope.activeModal && !mainProcess.is("cursorFree") &&
            nativeInput !== document.activeElement && (tab &&!tab.child)) {
            element.focus();
          }
        }

        element.on("keydown", function (event) {
          var TABKEY = 9;
          var UPKEY = 38;
          var DOWNKEY = 40;

          if (!tab) {
            return;
          }

          if (event.keyCode === TABKEY) {
            event.preventDefault();
            event.stopImmediatePropagation();
            globalFocus();

            tab.input = tab.input || "";

            var input = tab.input;
            var selected = input.slice(this.selectionStart, this.selectionEnd);

            tab.input = input.replace(selected, "");

            console.log("tab.input", tab.input);

            var args = tab.input.split(" ");

            args.shift();

            var dir = tab.cwd;
            var lastArg = "";

            if (args.length > 0) {
              lastArg = args[args.length - 1];
              dir = path.resolve(tab.cwd, lastArg);
              console.log("lastArg", lastArg);
              console.log("dir", dir);
            }

            var stats;
            var filter;

            try {
              fsCache[dir] = stats = fsCache[dir] || fs.statSync(dir);
              if (selected.length === 0 && tab.input[tab.input.length - 1] !== "/" && lastArg !== "") {
                tab.input += "/";
              }
            } catch (e) {
              var splitted = dir.split("\\");
              filter = splitted.pop();
              dir = splitted.join("\\") + "\\";
              try {
                fsCache[dir] = stats = fsCache[dir] || fs.statSync(dir);
              } catch (err) {

              }
            }

            if (stats) {
              var list = fs.readdirSync(dir);
              console.log("list", list);
              console.log("dir", dir);
              console.log("filter", filter);

              if (filter) {
                list = list.filter(function (item) {
                  return item.indexOf(filter) === 0;
                });

                list = list.map(function (item) {
                  return item.replace(filter, "");
                });
              }

              var index = list.indexOf(selected) + 1;

              if (lastArg === "" && tab.input[tab.input.length - 1] !== " " && tab.input.trim().length > 0) {
                tab.input += " ";
              }

              if (list[index]) {
                tab.input += list[index];

                $timeout(function () {
                  element[0].setSelectionRange(tab.input.length - list[index].length, tab.input.length);
                });
              }
            }

            console.log("input", input);
            console.log("selected", selected, this.selectionStart, this.selectionEnd - this.selectionStart);
          }
          if (event.keyCode === UPKEY) {
            if (tab.historyIndex === null) {
              tab.historyIndex = tab.history.length - 1;
            } else if (tab.historyIndex > 0) {
              tab.historyIndex--;
            }
            if (tab.historyIndex >= 0) {
              tab.input = tab.history[tab.historyIndex];
            }
          }
          if (event.keyCode === DOWNKEY) {
            if (tab.historyIndex !== null) {
              if (tab.historyIndex - 1 < tab.history.length) {
                tab.historyIndex++;
                tab.input = tab.history[tab.historyIndex];
              } else {
                tab.input = "";
              }
            }
          }

          tab.input = tab.input || "";

          if (event.keyCode === DOWNKEY || event.keyCode === UPKEY) {
            event.preventDefault();
            console.log("tab.input.length", tab.input.length);
            $timeout(function () {
              setCaretPosition(element[0], tab.input.length);
            });
          }

          if (!scope.$$phase) {
            scope.$apply();
          }
        });
      }
    };
  }

  function setCaretPosition(elem, caretPos) {
    if ("createTextRange" in elem) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if ("selectionStart" in elem) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      } else {
        elem.focus();
      }
    }
  }

})();