/*global require*/
/*global angular*/
/*global document*/
/*global __dirname*/

(function () {
  'use strict';

  var child_process = require("child_process");
  var fs = require("fs");
  var Q = require("q");

  angular.module("app").run(GitBranchProcess);

  GitBranchProcess.$inject = ["mainProcess", "$timeout", "$rootScope", "$mdDialog", "$q", "debounce", "execute"];

  function GitBranchProcess(mainProcess, $timeout, $rootScope, $mdDialog, $q, debounce, execute) {

    $rootScope.gitModal = gitModal;
    $rootScope.gitModalOpened = false;

    function clean(tab) {
      delete tab.branches;
      delete tab.branch;
    }

    mainProcess.on("tab.cwd", function (cwd, tab) {
      gitHandler(tab);

      var debouncedGitHandler = debounce(function () {
        gitHandler(tab);
      }, 100);

      tab.cwdWatcher.on("change", function (event, file) {
        if (file === null || file === ".git") {
          debouncedGitHandler();
        }
      })
    });

    function gitHandler(tab) {
      if (!tab) {
        return;
      }
      var gitFolder;

      try {
        fs.readdirSync(tab.cwd + "\\.git");
        gitFolder = true
      } catch (ex) {
        gitFolder = false
      }

      if (gitFolder) {
        getBranches(tab)
            .then(function (branches) {
              tab.branches = branches;
              for (var i = 0; i < branches.length; i++) {
                var branch = branches[i];
                if (branch.active) {
                  tab.branch = branch;
                  break;
                }
              }
            })
            .catch(clean)
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });
      } else {
        clean(tab);
      }
    }

    function gitModal($event, tab, selectedIndex) {
      if ($rootScope.gitModalOpened) {
        return;
      }

      $rootScope.gitModalOpened = true;
      $rootScope.activeModal = $mdDialog
          .show({
            controller: DialogController,
            templateUrl: __dirname + '\\..\\templates\\git.modal.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            locals: {
              tab: tab,
              selectedIndex: selectedIndex || 0
            }
          })
          .then(function () {

          }, function () {

          })
          .finally(function () {
            $rootScope.gitModalOpened = false;
            $rootScope.activeModal = null;
          });
    }

    DialogController.$inject = ["$scope", "$mdDialog", "tab", "selectedIndex"];
    function DialogController($scope, $mdDialog, tab, selectedIndex) {
      var regexChanges = /diff --git a\/(.*) b\/(.*)/ig;
      var regexUnversioned = /Would remove (.*)/ig;

      $scope.loadingUnversioned = true;
      $scope.loadingChanges = true;
      $scope.loadingHistory = true;
      $scope.selectedIndex = selectedIndex;
      $scope.tab = tab;

      $scope.$watch("tab.branch.name", function (name) {
        if (name) {
          selectGitBranch(name);
        }
      });

      function selectGitBranch(branchName) {
        child_process.exec("git checkout " + branchName, {cwd: tab.cwd});
      }

      require("child_process").exec("git diff", {
        cwd: tab.cwd
      }, function (error, stdout) {
        $scope.loading = false;
        $timeout(function () {
          if (!error) {

            var match;
            var matches = [];

            do {
              match = regexChanges.exec(stdout);
              if (match) {
                matches.push(match[1]);
              }
            } while (match);

            $scope.matchesChanges = matches;
          }
          $scope.loadingChanges = false;
        });
      });

      require("child_process").exec("git clean -n", {
        cwd: tab.cwd
      }, function (error, stdout) {
        $scope.loading = false;
        $timeout(function () {
          if (!error) {

            var match;
            var matches = [];

            do {
              match = regexUnversioned.exec(stdout);
              if (match) {
                matches.push(match[1]);
              }
            } while (match);

            $scope.matchesUnversioned = matches;
          }
          $scope.loadingUnversioned = false;
        });
      });

      $q.wait(0).then(function () {
        require("child_process").exec("git log --pretty=format:\"{'hash': '%h', 'author':'%an', 'date':'%ar', 'message':'%s'},\"".replace(/'/gi, "\\\""), {
          cwd: tab.cwd
        }, function (error, stdout) {
          stdout = stdout.replace(/,$/gi, "");
          $scope.loading = false;
          $timeout(function () {
            if (!error) {
              $scope.matchesHistory = JSON.parse("[" + stdout + "]");
            }
            $scope.loadingHistory = false;
          });
        });
      });

      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
    }
  }

  function getBranches(tab) {
    return Q.npost(child_process, "exec", ["git branch", {cwd: tab.cwd}])
        .then(function (branches) {
          branches = branches[0];
          branches = branches.split("\n");
          branches = branches
              .filter(function (branch) {
                return branch.trim() !== "";
              })
              .map(function (branch) {
                return {
                  name: branch.replace("*", "").trim(),
                  active: branch[0] === "*"
                };
              });

          return branches;
        })
  }

})();