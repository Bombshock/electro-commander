/*global angular*/

(function () {
  'use strict';

  angular.module("app").service("config", configService);

  configService.$inject = [];

  function configService() {
    return require("../config.js");
  }

})();