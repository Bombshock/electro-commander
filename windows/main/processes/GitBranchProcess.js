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

  GitBranchProcess.$inject = ["mainProcess", "$timeout", "$rootScope", "$mdDialog", "$q", "debounce"];

  function GitBranchProcess(mainProcess, $timeout, $rootScope, $mdDialog, $q, debounce) {

    $rootScope.gitModal = gitModal;
    $rootScope.gitModalOpened = false;

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

      tab.git = tab.git || {};

      try {
        fs.readdirSync(tab.cwd + "\\.git");
        gitFolder = true
      } catch (ex) {
        gitFolder = false
      }

      if (gitFolder) {
        getBranches(tab)
            .then(function (branches) {
              tab.git.branches = branches;
              for (var i = 0; i < branches.length; i++) {
                var branch = branches[i];
                if (branch.active) {
                  tab.git.branch = branch;
                  break;
                }
              }
            })
            .catch(function (err) {
              console.error(err.stack ? err.stack : err);
              delete tab.git.branch;
              delete tab.git.branches;
            })
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });

        getChanges(tab)
            .then(function (changes) {
              tab.git.changes = changes;
            })
            .catch(function (err) {
              console.error(err.stack ? err.stack : err);
              delete tab.git.changes;
            })
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });

        getHistory(tab)
            .then(function (history) {
              tab.git.history = history;
            })
            .catch(function (err) {
              console.error(err.stack ? err.stack : err);
              delete tab.git.history;
            })
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });

        getUnversionedFiles(tab)
            .then(function (unversioned) {
              tab.git.unversioned = unversioned;
            })
            .catch(function (err) {
              console.error(err.stack ? err.stack : err);
              delete tab.git.unversioned;
            })
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });
      } else {
        delete tab.git;
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

      $scope.loadingUnversioned = true;
      $scope.loadingChanges = true;
      $scope.loadingHistory = true;
      $scope.selectedIndex = selectedIndex;
      $scope.tab = tab;
      
      $scope.commit = function () {
        gitCommit(tab, tab.git.commitMessage)
            .then(function () {
              delete tab.git.commitMessage;
            })
            .finally(function () {
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            });
      };

      $scope.$watch("tab.branch.name", function (name) {
        if (name) {
          selectGitBranch(name);
        }
      });

      function selectGitBranch(branchName) {
        child_process.exec("git checkout " + branchName, {cwd: tab.cwd});
      }

      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
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

  function getChanges(tab) {
    var regexChanges = /diff --git a\/(.*) b\/(.*)/ig;
    return Q.npost(child_process, "exec", ["git diff", {cwd: tab.cwd}])
        .then(function (result) {
          var match;
          var matches = [];

          do {
            match = regexChanges.exec(result);
            if (match) {
              matches.push(match[1]);
            }
          } while (match);
          return matches;
        });
  }

  function getUnversionedFiles(tab) {
    var regexUnversioned = /Would remove (.*)/ig;
    return Q.npost(child_process, "exec", ["git clean -n", {cwd: tab.cwd}])
        .then(function (result) {
          var match;
          var matches = [];

          do {
            match = regexUnversioned.exec(result);
            if (match) {
              matches.push(match[1]);
            }
          } while (match);

          return matches;
        });
  }

  function getHistory(tab) {
    return Q.npost(child_process, "exec", ['git log --pretty=format:"{\\"hash\\": \\"%h\\", \\"author\\":\\"%an\\", \\"date\\":\\"%ar\\", \\"message\\":\\"%s\\"},\"', {cwd: tab.cwd}])
        .then(function (result) {
          result = result[0].replace(/,$/gi, "");
          return JSON.parse("[" + result + "]");
        });
  }

  function gitCommit(tab, message) {
    message = message.replace(/"/gi, "\\\"");
    return Q.npost(child_process, "exec", ['git commit -a -m "' + message + '"', {cwd: tab.cwd}]);
  }

})();