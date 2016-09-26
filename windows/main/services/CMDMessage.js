/*global angular*/

(function () {
  'use strict';

  angular.module("app").service("CMDMessage", CMDMessageService);

  CMDMessageService.$inject = ["$sce", "$rootScope"];

  function CMDMessageService($sce, $rootScope) {
    var colorSet = require(__dirname + "\\..\\colors.json");

    function CMDMessage(message, type) {
      this.message = message || '';
      this.type = type || CMDMessage.TYPE_DEFAULT;
    }

    CMDMessage.TYPE_ERROR = 'error';
    CMDMessage.TYPE_DEFAULT = 'default';
    CMDMessage.TYPE_COMMAND = 'command';
    CMDMessage.TYPE_SUCCESS = 'success';

    CMDMessage.prototype.toJSON = function () {
      return {
        message: this.message,
        type: this.type
      };
    };

    CMDMessage.prototype.toString = function () {
      var urlRegex = /(http|https):\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*/g;
      var open = 0;
      var replaced = this.message;

      replaced = replaced.replace(/</g, "&lt;");
      replaced = replaced.replace(/>/g, "&gt;");

      replaced = replaced.replace(/\x1b*\[\d+m/ig, function (found) {
        var int = /\d+/.exec(found)[0];
        int = parseInt(int);
        var out = "";
        if (int === 0 || int === 49 || int === 39 || int === 24) {
          for (var i = 0; i < open; i++) {
            out += "</span>";
          }
          open = 0;
        } else if (colorSet[int]) {
          open++;
          out += "<span style=\"" + colorSet[int] + "\">";
        }
        return out;
      });

      for (var i = 0; i < open; i++) {
        replaced += "</span>";
      }

      replaced = replaced.replace(urlRegex, function (url) {
        return '<a onclick="openUrl(\'' + url + '\'); return false;" href="">' + url + '</a>';
      });

      if ($rootScope.activeTab && $rootScope.activeTab.child && this === $rootScope.activeTab.child.msg) {
        replaced += ' <i class="fa fa-spinner fa-spin current-task"></i>';
      }

      return $sce.trustAsHtml(replaced);
    };

    return CMDMessage;
  }

})();