/*jshint -W030 */
(function() {
  'use strict';
  var NyanCat = require('./lib/nyanCat').NyanCat;

  NyanCat.$inject = ['baseReporterDecorator', 'formatError', 'config'];

  module.exports = {
    'reporter:nyan': ['type', NyanCat]
  };

})();
