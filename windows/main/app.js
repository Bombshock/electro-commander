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
    "$rootScope",
    "execute",
    "tabs",
    function ($scope, execute, tabs) {

      var storage = localStorage || {};
      var MAX_LINES = 250;

      process.chdir(process.env.CWD || process.env.USERPROFILE);

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      $scope.execute = execute;
      $scope.input = "";
      $scope.tabs = tabs;
      $scope.selectedIndex = storage.selectedIndex || 0;

      $scope.$watch(function () {
        storage.selectedIndex = $scope.selectedIndex || 0;
        $scope.activeTab = $scope.tabs[storage.selectedIndex];
      });

      $scope.$watch("activeTab", function (activeTab) {
        console.log("activeTab", activeTab);
      });

      $scope.$watch("selectedIndex", function (selectedIndex) {
        console.log("selectedIndex", selectedIndex);
      });

      $scope.$watchCollection("activeTab.lines", function (lines) {
        if (lines) {
          while (lines.length > MAX_LINES) {
            lines.shift();
          }
        }
      });
    }
  ]);

  window.openUrl = function (url) {
    require("open")(url);
  };

  require("./app-loader")(document);

})();