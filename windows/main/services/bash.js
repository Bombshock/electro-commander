/*global angular*/

(function () {
  'use strict';

  angular.module("app").service("bash", bashService);

  bashService.$inject = [];

  function bashService() {
    return require('include-all')({
      dirname: __dirname + '/../../../bash',
      filter: /(.*)\.js$/
    });
  }

})();