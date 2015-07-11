'use strict';

var dt = require('./types');

/**
 * DataStore - Class
 *
 * Used to create a data storage that persists for
 * the life of a test run. This class has several
 * helper methods to look up different data-types
 * and insert them if they don't already exists.
 *
 * An instance of this class is exported.
 */

var DataStore = function() {
  var data = []; // This is an array of suites

  this.getData = function() {
    return data;
  };
};

DataStore.prototype.save = function(browser, result) {
  if (!result.success && !result.skipped && result.suite.length > 0) {
    var suite = this.findSuiteInResult(result);

    this.saveResultToSuite(suite, browser, result);
  }
};

DataStore.prototype.saveResultToSuite = function(suite, browser, result) {
  suite.tests = (!suite.tests) ? [] : suite.tests;
  var test = this.findTestByName(suite.tests, result.description);
  test.depth = suite.depth + 1;

  var brwsr = this.findBrowserByName(test.browsers, browser.name);
  brwsr.depth = test.depth + 1;

  if(result.log && result.log[0] !== null){
    brwsr.errors = result.log[0].split('\n');
  }
};

DataStore.prototype.findSuiteInResult = function(result) {
  var suite, self = this;
  var searchArray = self.getData();

  result.suite.forEach(function(suiteName, i) {
    suite = self.findSuiteByName(searchArray, suiteName);
    suite.depth = i;

    suite.suites = (!suite.suites) ? [] : suite.suites;
    searchArray = suite.suites;
  });

  return suite;
};

DataStore.prototype.findByName = function(arr, name, Constructor) {
  var it;
  // Look through the array for an object with a
  // 'name' property that matches the 'name' arg
  arr.every(function(el) {
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
};

DataStore.prototype.findSuiteByName = function(arr, name) {
  return this.findByName(arr, name, dt.Suite);
};

DataStore.prototype.findTestByName = function(arr, name) {
  return this.findByName(arr, name, dt.Test);
};

DataStore.prototype.findBrowserByName = function(arr, name) {
  return this.findByName(arr, name, dt.Browser);
};

exports.getInstance = function() { return new DataStore(); };
