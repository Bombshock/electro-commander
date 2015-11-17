/*global angular*/

(function () {
  'use strict';

  var fs = require("fs");

  angular.module("app").run(ConfigProcess);
  ConfigProcess.$inject = ["$rootScope", "$mdDialog"];
  function ConfigProcess($rootScope, $mdDialog) {
    $rootScope.configModal = configModal;
    function configModal($event) {
      $rootScope.activeModal = $mdDialog
        .show({
          controller: DialogController,
          templateUrl: __dirname + '\\..\\templates\\config.modal.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true
        })
        .finally(function () {
          $rootScope.activeModal = null;
        });
    }
  }

  DialogController.$inject = ["$scope", "$mdDialog", "config", "windowsRegistry"];
  function DialogController($scope, $mdDialog, config, windowsRegistry) {

    $scope.config = config;

    $scope.$watch("config", function (config) {
      config.save();
    }, true);

    $scope.$watch("config.windows.autostart", function (autostart) {
      if (autostart) {
        windowsRegistry.addAutostart();
      } else {
        windowsRegistry.removeAutostart();
      }
    });

    $scope.$watch("config.windows.contextMenu", function (contextMenu) {
      console.log("contextMenu", !!contextMenu);
      if (contextMenu) {
        windowsRegistry.addContextMenu();
      } else {
        windowsRegistry.eraseContextMenu();
      }
    });

    $scope.cancel = function () {
      $mdDialog.cancel();
    };
  }

})();