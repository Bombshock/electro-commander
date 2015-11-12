/*global angular*/

(function () {
  'use strict';

  angular.module("app").directive("mdTabContent", scrollDownDirective);

  scrollDownDirective.$inject = ["mainProcess"];

  function scrollDownDirective(mainProcess) {
    var isScrolling = false;
    return {
      restrict: 'E',
      require: '^?scrollDownTabs',
      link: function (scope, element, attributes, controller) {
        var el = element[0];

        if (!controller) {
          return;
        }

        var scrollDown = debounce(function () {
          scrollTo(el, el.scrollHeight - el.offsetHeight, 150);
        }, 100);

        mainProcess.on("cursorFree", function (cursorFree) {
          if (!cursorFree) {
            scrollDown();
          }
        });

        scope.$watch(function () {
          if (!mainProcess.is("cursorFree")) {
            if (el.scrollTop < el.scrollHeight - el.offsetHeight) {
              scrollDown();
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