/*global angular*/

(function () {
  'use strict';

  angular.module("app").directive("mdTabContent", scrollDownDirective);

  scrollDownDirective.$inject = ["$timeout"];

  function scrollDownDirective($timeout) {
    var isScrolling = false;
    return {
      restrict: 'E',
      require: '^?scrollDownTabs',
      link: function (scope, element, attributes, controller) {
        var el = element[0];
        var ctrlDown = false;

        if (!controller) {
          return;
        }

        var fn = debounce(function () {
          scrollTo(el, el.scrollHeight - el.offsetHeight, 150);
        }, 50);

        window.addEventListener("keydown", function (event) {
          if (event.keyCode === 17) {
            ctrlDown = true;
          }
        });

        window.addEventListener("keyup", function (event) {
          if (event.keyCode === 17) {
            ctrlDown = false;
          }
        });

        scope.$watch(function () {
          if (!ctrlDown) {
            if (el.scrollTop < el.scrollHeight - el.offsetHeight) {
              $timeout(fn, 0, false);
            }
          }
        });
      }
    };

    function debounce(fn, delay) {
      var timer = null;
      return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    }

    function scrollTo(element, to, duration) {

      if (isScrolling) {
        return;
      }

      var start = element.scrollTop,
        change = to - start,
        increment = 15; // ~60fps

      isScrolling = true;

      var animateScroll = function (elapsedTime) {
        elapsedTime += increment;
        element.scrollTop = easeInOut(elapsedTime, start, change, duration);
        if (elapsedTime < duration) {
          setTimeout(function () {
            animateScroll(elapsedTime);
          }, increment);
        } else {
          element.scrollTop += 10;
          isScrolling = false;
        }
      };

      animateScroll(0);
    }
  }

  function easeInOut(currentTime, start, change, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
    }
    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  }

  angular.module("app").directive("scrollDownTabs", scrollDownTabsDirective);

  scrollDownTabsDirective.$inject = [];

  function scrollDownTabsDirective() {
    return {
      controller: function () {

      }
    };
  }


})();