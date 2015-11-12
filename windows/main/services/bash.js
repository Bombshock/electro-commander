/*global angular*/

(function () {
  'use strict';

  angular.module("app").provider("bash", bashProvider);

  bashProvider.$inject = [];

  /*jshint -W040*/
  function bashProvider() {
    var bash = {};

    this.register = function (namespace, fn) {
      bash[namespace] = fn;
    };

    this.$get = function () {
      return bash;
    };
  }

})();