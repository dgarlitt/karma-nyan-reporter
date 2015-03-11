(function() {
  'use strict';

  var dt = require('./data_types.js');

  var findSuiteByName = exports.findSuiteByName = function findSuiteByName(arr, name) {
    return findByName(arr, name, dt.Suite);
  }

  var findTestByName = exports.findTestByName = function findTestByName(arr, name) {
    return findByName(arr, name, dt.Test);
  }

  var findBrowserByName = exports.findBrowserByName = function findBrowserByName(arr, name) {
    return findByName(arr, name, dt.Browser);
  }

  function findByName(arr, name, Constructor) {
    var it;
    // Look through the array for an object with a
    // 'name' property that matches the 'name' arg
    arr.every(function(el, i, arr) {
      if (el.name === name) {
        it = el;
        return false;
      }
      return true;
    });

    // If a matching object is not found, create a
    // new one and push it to the provided array
    if (!it) {
      it = new Constructor(name);
      arr.push(it);
    }

    // return the object
    return it;
  }

})();
