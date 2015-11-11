/*global angular*/
/*global document*/
/*global __dirname*/

(function () {
  'use strict';

  angular.module("app").run(GitBranchProcess);

  GitBranchProcess.$inject = ["mainProcess", "$timeout", "$rootScope", "$mdDialog", "$q"];

  function GitBranchProcess(mainProcess, $timeout, $rootScope, $mdDialog, $q) {
    mainProcess.on("cycle", gitBranchCycle);
    $rootScope.gitModal = gitModal;
    $rootScope.gitModalOpened = false;

    function gitBranchCycle(reason, activeTab) {
      if (reason === "cwd") {
        var gitFolder = activeTab.ls[activeTab.ls.indexOf(".git")];

        if (gitFolder) {
          require("child_process").exec("git branch", {
            cwd: activeTab.cwd
          }, function (error, stdout) {
            $timeout(function () {
              if (error) {
                delete activeTab.branch;
              } else {
                activeTab.branch = stdout.replace("*", "").trim();
              }
            });
          });
        } else {
          delete activeTab.branch;
        }
      }
    }

    function gitModal($event, tab) {
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
              tab: tab
            }
          })
          .then(function (answer) {

          }, function () {

          })
          .finally(function () {
            $rootScope.gitModalOpened = false;
            $rootScope.activeModal = null;
          });
    }

    DialogController.$inject = ["$scope", "$mdDialog", "tab"];
    function DialogController($scope, $mdDialog, tab) {
      var regexChanges = /diff --git a\/(.*) b\/(.*)/ig;
      var regexUnversioned = /Would remove (.*)/ig;

      $scope.loadingUnversioned = true;
      $scope.loadingChanges = true;
      $scope.loadingHistory = true;

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

      $q.wait(5000).then(function () {
        require("child_process").exec("git log --pretty=format:\"{'hash': '%h', 'author':'%an', 'date':'%ar', 'message':'%s'},\"".replace(/'/gi, "\\\""), {
          cwd: tab.cwd
        }, function (error, stdout) {
          stdout = stdout.replace(/,$/gi, "");
          console.log("stdout", stdout);
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

})();