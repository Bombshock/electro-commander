/*global angular*/
/*global require*/
/*global process*/
/*global __dirname*/

(function () {
  "use strict";

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

      $mdThemingProvider.theme('github')
          .dark()
          .accentPalette('grey')
          .primaryPalette('blue')
          .backgroundPalette('black');

      // Dark Theme
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
    function ($scope, execute, tabs, $q, $timeout) {
      var storage = localStorage || {};
      var MAX_LINES = 250;

      $q.wait = function (time, arg) {
        var deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(arg);
        }, time | 0);
        return deferred.promise;
      };

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

      $scope.$watchCollection("activeTab.lines", function (lines) {
        if (lines) {
          while (lines.length > MAX_LINES) {
            lines.shift();
          }
        }
      });

      $scope.openUrl = window.openUrl = function (url) {
        require("open")(url);
      };
    }
  ]);

  require("./app-loader")(document);

})();