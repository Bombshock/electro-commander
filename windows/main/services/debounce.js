/*global angular*/

(function () {
  'use strict';

  angular.module("app").service("debounce", debounceService);

  debounceService.$inject = ["$timeout"];

  function debounceService($timeout) {
    return function debounce(func, wait, scope) {
      var timeout;
      return function debounceExecutable() {
        var context = scope || this, args = arguments;
        $timeout.cancel(timeout);
        timeout = $timeout(function () {
          timeout = null;
          func.apply(context, args);
        }, wait);
      };
    };
  }

})();