/*jshint -W030 */
(function() {
  'use strict';
  var tty = require('tty');
  var clc = require('cli-color');
  var util = require('./lib/storage_util.js');
  var printers = require('./lib/printers.js');
  var Shell = require('./lib/shell_util.js');

  /**
   * NyanCat constructor
   */

  function NyanCat(baseReporterDecorator, formatError, config) {
    var self = this;
    var defaultOptions = function() {
      return {
        suppressErrorReport: false
      };
    };

    self.options = defaultOptions();

    if ( config && config.nyanReporter ) {
      // merge defaults
      Object.keys( self.options ).forEach(function(optionName){
        if ( config.nyanReporter.hasOwnProperty(optionName) ) {
          self.options[optionName] = config.nyanReporter[optionName];
        }
      });
    }

    self.adapterMessages = [];

    self.adapters = [function(msg) {
      adapterMessages.push(msg);
    }];
  }


  NyanCat.prototype.reset = function() {
    var width = Shell.window.width * 0.75 | 0;

    this.stats;
    this.rainbowColors = this.generateColors();
    this.colorIndex = 0;
    this.numberOfLines = 4;
    this.browser_logs = {};
    this.trajectories = [[], [], [], []];
    this.nyanCatWidth = 11;
    this.trajectoryWidthMax = (width - this.nyanCatWidth);
    this.scoreboardWidth = 5;
    this.tick = 0;
    this.colors = {
        'gray': 90,
        'fail': 31,
        'bright_pass': 92,
        'bright_fail': 91,
        'bright_yellow': 93,
        'skip': 36,
        'suite': 0,
        'error title': 0,
        'error message': 31,
        'error stack': 90,
        'checkmark': 32,
        'fast': 90,
        'medium': 33,
        'slow': 31,
        'pass': 32,
        'light': 90,
        'diff gutter': 90,
        'diff added': 42,
        'diff removed': 41
    };
    this._browsers = [];
    this.browser_logs = {};
    this.browserErrors = [];
    this.allResults = {};
    this.errors = [];
    this.totalTime = 0;
    this.numberOfSlowTests = 0;
  };


  NyanCat.prototype.color = function(type, str) {
    if (config.colors === false) return str;
    return '\u001b[' + this.colors[type] + 'm' + str + '\u001b[0m';
  };



  /**
   * onRunStart - karma api method
   *
   * called at the beginning of each test run
   */

  NyanCat.prototype.onRunStart = function (browsers) {
    Shell.cursor.hide();
    this.reset();
    this.numberOfBrowsers = (browsers || []).length;
    printers.write('\n');
  };

  /**
   * onBrowserLog - karma api method
   *
   * called each time a browser encounters a
   * console message (console.log, console.info, etc...)
   */

  NyanCat.prototype.onBrowserLog = function(browser, log, type) {
    if (! this.browser_logs[browser.id]) {
      this.browser_logs[browser.id] = {
        name: browser.name,
        log_messages: []
      };
    }

    this.browser_logs[browser.id].log_messages.push(log);
  };

  /**
   * onSpecComplete - karma api method
   *
   * called when each test finishes
   */

  NyanCat.prototype.onSpecComplete = function(browser, result) {
    this.stats = browser.lastResult;

    if (!this.options.suppressErrorReport && !result.success && !result.skipped) {
        var searchArray = this.errors;

        result.suite.forEach(function(suiteName, i, arr) {
          var suite = util.findSuiteByName(searchArray, suiteName);

          // if we reached the last suite
          // set the test information
          if (i == arr.length - 1 ) {
            suite.tests = (!suite.tests) ? [] : suite.tests;
            var test = util.findTestByName(suite.tests, result.description);
            var brwsr = util.findBrowserByName(test.browsers, browser.name);

            if(result.log[0] !== null){
              brwsr.errors = result.log[0].split('\n');
            }

          // otherwise, keep looping through sub-suites
          } else {
            suite.suites = (!suite.suites) ? [] : suite.suites;
            searchArray = suite.suites;
          }

        });

    }

    this.draw();
  };

  /**
   * onRunComplete - karma api method
   *
   * called either when a browser encounters
   * an error or when all tests have run
   */

  NyanCat.prototype.onRunComplete = function(browsers, results) {
    if (this.browserErrors.length) {
      printers.printBrowserErrors(this);
    } else {
      printers.printTestFailures(this, this.options.suppressErrorReport);
    }
    Shell.cursor.show();
  };

  /**
   * onBrowserStart - karma api method
   *
   * called when each browser is launched
   */

  NyanCat.prototype.onBrowserStart = function (browser) {
    this._browsers.push(browser);
    this.numberOfBrowsers = this._browsers.length;
  };

  /**
   * onBrowserError - karma api method
   *
   * called when a browser encounters a compilation
   * error at runtime
   */

  NyanCat.prototype.onBrowserError = function(browser, error) {
    this.browserErrors.push({"browser": browser, "error": error});
  };






  /**
   * Draw the nyan cat
   *
   * @api private
   */

  NyanCat.prototype.draw = function(){
    this.appendRainbow();
    this.drawScoreboard();
    this.drawRainbow();
    this.drawNyanCat();
    this.tick = !this.tick;
  };

  /**
   * Draw the "scoreboard" showing the number
   * of passes, failures and pending tests.
   *
   * @api private
   */

  NyanCat.prototype.drawScoreboard = function(){
    var stats = this.stats;
    var colors = this.colors;

    function draw(color, n) {
      printers.write(' ');
      printers.write('\u001b[' + color + 'm' + n + '\u001b[0m');
      printers.write('\n');
    }

    draw(colors.pass, stats.success);
    draw(colors.fail, stats.failed);
    draw(colors.skip, stats.skipped);
    printers.write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Append the rainbow.
   *
   * @api private
   */

  NyanCat.prototype.appendRainbow = function(){
    var segment = this.tick ? '_' : '-';
    var rainbowified = this.rainbowify(segment);

    for (var index = 0; index < this.numberOfLines; index++) {
      var trajectory = this.trajectories[index];
      if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();
      trajectory.push(rainbowified);
    }
  };

  /**
   * Draw the rainbow.
   *
   * @api private
   */

  NyanCat.prototype.drawRainbow = function(){
    var self = this;

    this.trajectories.forEach(function(line, index) {
      printers.write('\u001b[' + self.scoreboardWidth + 'C');
      printers.write(line.join(''));
      printers.write('\n');
    });

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw the nyan cat
   *
   * @api private
   */

  NyanCat.prototype.drawNyanCat = function() {
    var self = this;
    var startWidth = this.scoreboardWidth + this.trajectories[0].length;
    var color = '\u001b[' + startWidth + 'C';
    var padding = '';

    printers.write(color);
    printers.write('_,------,');
    printers.write('\n');

    printers.write(color);
    padding = self.tick ? '  ' : '   ';
    printers.write('_|' + padding + '/\\_/\\ ');
    printers.write('\n');

    printers.write(color);
    padding = self.tick ? '_' : '__';
    var tail = self.tick ? '~' : '^';
    var face;
    printers.write(tail + '|' + padding + this.face() + ' ');
    printers.write('\n');

    printers.write(color);
    padding = self.tick ? ' ' : '  ';
    printers.write(padding + '""  "" ');
    printers.write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw nyan cat face.
   *
   * @return {String}
   * @api private
   */

  NyanCat.prototype.face = function() {
    var stats = this.stats;
    if (stats.failed) {
      return '( x .x)';
    } else if (stats.skipped) {
      return '( o .o)';
    } else if(stats.success) {
      return '( ^ .^)';
    } else {
      return '( - .-)';
    }
  };

  /**
   * Move cursor up `n`.
   *
   * @param {Number} n
   * @api private
   */

  NyanCat.prototype.cursorUp = function(n) {
    printers.write('\u001b[' + n + 'A');
  };

  /**
   * Move cursor down `n`.
   *
   * @param {Number} n
   * @api private
   */

  NyanCat.prototype.cursorDown = function(n) {
    printers.write('\u001b[' + n + 'B');
  };

  /**
   * Generate rainbow colors.
   *
   * @return {Array}
   * @api private
   */

  NyanCat.prototype.generateColors = function() {
    var colors = [];

    for (var i = 0; i < (6 * 7); i++) {
      var pi3 = Math.floor(Math.PI / 3);
      var n = (i * (1.0 / 6));
      var r = Math.floor(3 * Math.sin(n) + 3);
      var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
      var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
      colors.push(36 * r + 6 * g + b + 16);
    }

    return colors;
  };

  /**
   * Apply rainbow to the given `str`.
   *
   * @param {String} str
   * @return {String}
   * @api private
   */

  NyanCat.prototype.rainbowify = function(str) {
    var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];
    this.colorIndex += 1;
    return '\u001b[38;5;' + color + 'm' + str + '\u001b[0m';
  };

  NyanCat.$inject = ['baseReporterDecorator', 'formatError', 'config'];

  module.exports = {
    'reporter:nyan': ['type', NyanCat]
  };

})();
