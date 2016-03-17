'use strict';

var dataStore = require('./data/store');
var dataTypes = require('./data/types');
var drawUtil = require('./util/draw');
var printers = require('./util/printers');
var rainbowifier = require('./util/rainbowifier');
var shellUtil = require('./util/shell').getInstance();
var fs = require('fs');

/**
 * NyanCat constructor
 */

function NyanCat(baseReporterDecorator, formatError, config) {
  var self = this;
  var defaultOptions = function() {
    return {
      suppressErrorReport: false,
      suppressErrorHighlighting: false,
      numberOfRainbowLines: 4,
      renderOnRunCompleteOnly: false
    };
  };

  self.options = defaultOptions();

  if (config && config.nyanReporter) {
    // merge defaults
    Object.keys(self.options).forEach(function(optionName){
      if (config.nyanReporter.hasOwnProperty(optionName)) {
        self.options[optionName] = config.nyanReporter[optionName];
      }
    });
  }

  self.adapters = [fs.writeSync.bind(fs.writeSync, 1)];
  dataTypes.setErrorFormatterMethod(formatError);

  if (self.options.suppressErrorHighlighting) {
    dataTypes.suppressErrorHighlighting();
  }
}


NyanCat.prototype.reset = function() {
  var numOfLines = this.options.numberOfRainbowLines;

  this.allResults = {};
  this._browsers = [];
  this.browser_logs = {};
  this.browserErrors = [];
  this.colorIndex = 0;
  this.dataStore = dataStore.getInstance();
  this.drawUtil = drawUtil.getInstance(numOfLines);
  this.rainbowifier = rainbowifier.getInstance();
  this.stats = {};

  this.totalTime = 0;
  this.numberOfSlowTests = 0;
};

/**
 * Draw the nyan cat
 *
 * @api private
 */

NyanCat.prototype.draw = function(appendOnly){
  this.drawUtil.appendRainbow(this.rainbowifier);
  if (!appendOnly) {
    this.drawUtil.drawScoreboard(this.stats);
    this.drawUtil.drawRainbow();
    this.drawUtil.drawNyanCat(this.stats);
  }
  this.drawUtil.tick = !this.drawUtil.tick;
};



/*******************************************************/
/*************** Karma LifeCycle Mehtods ***************/
/*******************************************************/

/**
 * onRunStart - karma api method
 *
 * called at the beginning of each test run
 */

NyanCat.prototype.onRunStart = function (browsers) {
  shellUtil.cursor.hide();
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

NyanCat.prototype.onBrowserLog = function(browser, log) {
  if (!this.browser_logs[browser.id]) {
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

  if (!this.options.suppressErrorReport) {
    this.dataStore.save(browser, result);
  }

  this.draw(this.options.renderOnRunCompleteOnly);
};

/**
 * onRunComplete - karma api method
 *
 * called either when a browser encounters
 * an error or when all tests have run
 */

NyanCat.prototype.onRunComplete = function() {
  this.draw();

  if (this.browserErrors.length) {
    printers.printRuntimeErrors(this.rainbowifier.rainbowify, this.browserErrors);
  } else {
    this.drawUtil.fillWithNewlines();
    printers.printTestFailures(this.dataStore.getData(), this.options.suppressErrorReport);
    printers.printStats(this.stats);
    printers.printBrowserLogs(this.browser_logs);
  }
  shellUtil.cursor.show();
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
  this.browserErrors.push({'browser': browser, 'error': error});
};

exports.NyanCat = NyanCat;
