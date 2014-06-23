'use strict';
var tty = require('tty');
var clc = require('cli-color');

// Emulate the Mocha base class a little bit
// just to get things going

 var BaseClass = function() {
  var self = this;

  this.isatty = tty.isatty(1) && tty.isatty(2);

  this.window = {
    width : self.isatty ? process.stdout.getWindowSize
                      ? process.stdout.getWindowSize(1)[0]
                      : tty.getWindowSize()[1]
                    : 75
  };

  this.cursor = {
    hide: function(){
      self.isatty && process.stdout.write('\u001b[?25l');
    },

    show: function(){
      self.isatty && process.stdout.write('\u001b[?25h');
    },

    deleteLine: function(){
      self.isatty && process.stdout.write('\u001b[2K');
    },

    beginningOfLine: function(){
      self.isatty && process.stdout.write('\u001b[0G');
    },

    CR: function(){
      if (self.isatty) {
        self.cursor.deleteLine();
        self.cursor.beginningOfLine();
      } else {
        process.stdout.write('\n');
      }
    }
  };

 };

 var Base = new BaseClass();

function NyanCat(baseReporterDecorator, formatError, config) {

  var width = Base.window.width * .75 | 0;
  var self = this;

  self.stats;
  self.rainbowColors = self.generateColors();
  self.colorIndex = 0;
  self.numberOfLines = 4;
  self.trajectories = [[], [], [], []];
  self.nyanCatWidth = 11;
  self.trajectoryWidthMax = (width - self.nyanCatWidth)
  self.scoreboardWidth = 5;
  self.tick = 0;
  self.colors = {
      'gray': 90
    , 'fail': 31
    , 'bright_pass': 92
    , 'bright_fail': 91
    , 'bright_yellow': 93
    , 'skip': 36
    , 'suite': 0
    , 'error title': 0
    , 'error message': 31
    , 'error stack': 90
    , 'checkmark': 32
    , 'fast': 90
    , 'medium': 33
    , 'slow': 31
    , 'pass': 32
    , 'light': 90
    , 'diff gutter': 90
    , 'diff added': 42
    , 'diff removed': 41
  };

  self.onRunStart = function (browsers) {
    Base.cursor.hide();

    self._browsers = [];
    self.allResults = {};
    self.errors = [];
    self.totalTime = 0;
    self.numberOfSlowTests = 0;
    self.numberOfSkippedTests = 0;
    self.numberOfBrowsers = (browsers || []).length;

    write('\n');
  };

  self.onBrowserStart = function (browser) {
    self._browsers.push(browser);
    self.numberOfBrowsers = self._browsers.length;
  };

  self.onSpecComplete = function(browser, result) {
    self.stats = browser.lastResult;

    if(!result.success && !result.skipped) {
      var searchArray = self.errors;

      result.suite.forEach(function(suiteName, i, arr) {
        var suite = findByName(searchArray, suiteName, Suite);

        // if we reached the last suite
        // set the test information
        if (i == arr.length - 1 ) {
          suite.tests = (!suite.tests) ? [] : suite.tests;
          var test = findByName(suite.tests, result.description, Test);
          var brwsr = findByName(test.browsers, browser.name, Browser);
          brwsr.errors = result.log[0].split('\n');

        // Otherwise, keep looping through sub-suites
        } else {
          suite.suites = (!suite.suites) ? [] : suite.suites;
          searchArray = suite.suites;
        }

      });

    }

    self.draw();
  };

  self.onRunComplete = function(browsers, results) {
    write("\n");
    write("\n");
    write("\n");
    write("\n");
    write("\n");

    Base.cursor.show();

    if (self.stats) {
      printStats(self.stats);
    }

    if (self.errors.length) {
      printErrors(self.errors);
    }
  };

  function Browser(name) {
    this.name = name;
    this.errors = [];
  }

  function Test(name) {
    this.name = name;
    this.browsers = [];
  }

  function Suite(name) {
    this.name = name;
  };

  function shortestString(str1, str2) {
    if (str1.length < str2.length) {
      return str1;
    }
    return str2;
  }

  function findByName(arr, name, constructor) {
    var it;
    arr.every(function(el, i, arr) {
      if (el.name === name) {
        it = el;
        return false;
      }
      return true;
    });

    if (!it) {
      it = new constructor(name);
      arr.push(it);
    }

    return it;
  }

  function printStats(stats) {
    var inc = 3;

    write( clc.right(inc) );
    write( clc.green(stats.success + ' passed') );

    write( clc.right(inc) );
    write( clc.red(stats.failed + ' failed') );

    write( clc.right(inc) );
    write( clc.cyan(stats.skipped + ' skipped') );

    write('\n');
    write('\n');
  }


  function printErrors(errors) {
    var indentation = 0;
    var inc = 3; // increment amount
    var counter = 0; // a counter

    printFailures(errors, indentation);

    function printFailures(arr, indentation) {
      indentation += inc;
      arr.forEach(function(el, i, arr) {
        write(clc.right(indentation));
        if ( el instanceof Suite) {
          var str = el.name;

          if ( arr === errors ) {
            write( clc.white.underline(++counter + ') ' + str) );

          } else {
            write( clc.white(str) );
          }

        } else if ( el instanceof Test ) {
          write( clc.red(el.name) );

        } else if ( el instanceof Browser ) {
          write( clc.yellow(el.name) );
          printErrors(el.errors, indentation);

        }
        write('\n');
        if (el.browsers) {
          printFailures(el.browsers, indentation);
          write('\n');
        }
        if (el.tests) {
          printFailures(el.tests, indentation);
        }
        if (el.suites) {
          printFailures(el.suites, indentation);
        }
      });
    }

    function printErrors(errors, indentation) {
      var first = true;
      indentation += inc;
      errors.forEach(function(error, i, arr) {
        write('\n');
        write( clc.right(indentation) );
        if (first) {
          write( clc.redBright(error) );
        } else {
          write( clc.blackBright(error) );
        }
        first = false;
      });
    }

  } // end print fn

  this.color = function(type, str) {
    if (config.colors === false) return str;
    return '\u001b[' + self.colors[type] + 'm' + str + '\u001b[0m';
  };

}

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
    write(' ');
    write('\u001b[' + color + 'm' + n + '\u001b[0m');
    write('\n');
  }

  draw(colors.pass, stats.success);
  draw(colors.fail, stats.failed);
  draw(colors.skip, stats.skipped);
  write('\n');

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
    write('\u001b[' + self.scoreboardWidth + 'C');
    write(line.join(''));
    write('\n');
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

  write(color);
  write('_,------,');
  write('\n');

  write(color);
  padding = self.tick ? '  ' : '   ';
  write('_|' + padding + '/\\_/\\ ');
  write('\n');

  write(color);
  padding = self.tick ? '_' : '__';
  var tail = self.tick ? '~' : '^';
  var face;
  write(tail + '|' + padding + this.face() + ' ');
  write('\n');

  write(color);
  padding = self.tick ? ' ' : '  ';
  write(padding + '""  "" ');
  write('\n');

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
}

/**
 * Move cursor up `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorUp = function(n) {
  write('\u001b[' + n + 'A');
};

/**
 * Move cursor down `n`.
 *
 * @param {Number} n
 * @api private
 */

NyanCat.prototype.cursorDown = function(n) {
  write('\u001b[' + n + 'B');
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


/**
 * Stdout helper.
 */

function write(string) {
  process.stdout.write(string);
}

NyanCat.$inject = ['baseReporterDecorator', 'formatError', 'config'];

module.exports = {
  'reporter:nyan': ['type', NyanCat]
};
