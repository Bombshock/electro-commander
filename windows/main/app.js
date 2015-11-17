/*global angular*/
/*global require*/
/*global process*/
/*global __dirname*/

(function () {
  "use strict";

  process.argv.push("--color");

  var fs = require("fs");

  fs.mkdir(__dirname + "/conf", function () {
  });

  angular.module("app", ["ngMaterial"]);

  angular.module("app").config([
    "$mdThemingProvider",
    function ($mdThemingProvider) {

      //black background color
      var black = $mdThemingProvider.extendPalette('grey', {
        'A100': '333333'
      });
      $mdThemingProvider.definePalette('black', black);

      //noinspection JSUnresolvedFunction
      $mdThemingProvider.theme('github')
        .dark()
        .accentPalette('grey')
        .primaryPalette('blue')
        .backgroundPalette('black');

      // Dark Theme
      //noinspection JSUnresolvedFunction
      $mdThemingProvider.theme('dark')
        .dark()
        .accentPalette('grey', {
          'default': '200'
        })
        .primaryPalette('orange', {
          'default': '800'
        })
        .backgroundPalette('black');

      $mdThemingProvider.setDefaultTheme('dark');
    }
  ]);

  angular.module("app").controller("AppController", [
    "$rootScope",
    "execute",
    "tabs",
    "$q",
    "$timeout",
    "config",
    function ($scope, execute, tabs, $q, $timeout, config) {
      var storage = localStorage || {};

      $q.wait = function (time, arg) {
        var deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(arg);
        }, time || 0);
        return deferred.promise;
      };

      //noinspection JSUnresolvedVariable
      process.chdir(process.env.CWD || process.env.USERPROFILE);

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      $scope.execute = execute;
      $scope.input = "";
      $scope.tabs = tabs;
      $scope.selectedIndex = storage.selectedIndex || 0;

      if ($scope.selectedIndex >= $scope.tabs.length) {
        $scope.selectedIndex = $scope.tabs.length - 1;
      }

      $scope.$watch(function () {
        storage.selectedIndex = $scope.selectedIndex || 0;
        $scope.activeTab = $scope.tabs[storage.selectedIndex];
      });

      $scope.openUrl = window.openUrl = function (url) {
        require("open")(url);
      };

      var shinanigans = 0;
      var shinanigansCounter = 0, shinanigansCounterLast = 0;
      var shinanigansThreshold = 200;

      $scope.$watch(function () {
        shinanigans++;
        shinanigansCounter++;
        setTimeout(function () {
          shinanigans--;
        }, 1000);
      });

      $scope.$watchGroup(["selectedIndex", "tabs.length"], function () {
        $timeout(function () {
          if ($scope.tabs.length > 0) {
            if ($scope.selectedIndex === $scope.tabs.length) {
              $scope.selectedIndex--;
            }
            if ($scope.selectedIndex < 0 || $scope.selectedIndex > $scope.tabs.length) {
              $scope.selectedIndex = 0;
            }
          } else {
            $scope.selectedIndex = -1;
          }
        });
      });

      setInterval(function () {
        if (shinanigans > shinanigansThreshold) {
          console.error("shinanigans :: %s $applys/s", shinanigans);
        } else if (shinanigansCounterLast !== shinanigansCounter) {
          console.log("shinanigans :: counter:", shinanigansCounter);
          shinanigansCounterLast = shinanigansCounter;
        }
      }, 1000);
    }
  ]);

  require("./app-loader")(document);

})();