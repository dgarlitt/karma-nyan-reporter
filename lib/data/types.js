'use strict';

var clc = require('cli-color');

/*
 * Suites are the top level data structure
 * they can contain sub-suites and/or tests
 * sub-suites, would therefore be able to
 * contain their own sub-suites and/or tests
 */

// Global properties
var counter = 0;
var tab = 3;
var tabs = function(depth) {
  return clc.right(depth * tab + 1);
};

var errorHighlightingEnabled = true;

exports.suppressErrorHighlighting = function() {
  errorHighlightingEnabled = false;
};

var errorFormatterMethod = function(error) {
  return error.replace(/(\?.+?:)/, ':').trim();
};

exports.setErrorFormatterMethod = function(formatterMethod) {
  errorFormatterMethod = formatterMethod;
};

/**
 * Suite - Class
 *
 * Stores info about the sub-suites and tests that
 * failed resulting from a test run.
 * Knows how to output itself to a string.
 */

function Suite(name) {
  this.name = name.trim();
  this.depth = 0;
  this.suites = [];
  this.tests = [];
}

Suite.prototype.toString = function() {
  var out = [];

  if (this.depth === 0) {
    out.push(tabs(this.depth) + clc.white.underline(this.name));
  } else {
    out.push(tabs(this.depth) + clc.white(this.name));
  }

  this.tests.forEach(function(test) {
    out.push(test.toString().trim());
    out.push('');
  });

  this.suites.forEach(function(suite) {
    out.push(suite.toString().trim());
    out.push('');
  });

  out.push('');
  out.push('');

  out = out.join('\n');

  return out;
};


/**
 * Test - Class
 *
 * stores information about each tst failure
 * resulting from a test run.
 * Knows how to output itself to a string.
 */

function Test(name) {
  this.name = name.trim();
  this.depth = 0;
  this.browsers = [];
}

Test.prototype.toString = function() {
  var out = [];

  out.push(tabs(this.depth) + clc.red(this.name));

  this.browsers.forEach(function(browser) {
    out.push(browser.toString().trim());
  });

  return out.join('\n');
};


/**
 * Browser - Class
 *
 * stores information for each browser failure
 * resulting from a test run.
 * Knows how to output itself to a string.
 */

function Browser(name) {
  this.name = name.trim();
  this.depth = 0;
  this.errors = [];
}

Browser.prototype.toString = function() {
  var depth = this.depth;
  var out = [];

  out.push(tabs(this.depth) + clc.yellow(this.name));

  this.errors.forEach(function(error, i) {
    error = error.trim();
    if (i === 0) {
      out.push(tabs(depth + 1) + (++counter) + ') ' + clc.redBright(error));
    } else {

      error = errorFormatterMethod(error).trim();

      if (error.length) {
        if (error.indexOf('node_modules/') < 0 && errorHighlightingEnabled) {
          error = clc.black.bgRed(error);
        } else {
          error = clc.blackBright(error);
        }
        out.push(tabs(depth + 2) + error);
      }
    }
  });

  return out.join('\n');
};

exports.Suite = Suite;
exports.Test = Test;
exports.Browser = Browser;
