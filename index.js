/*jshint -W030 */
(function() {
  'use strict';
  var tty = require('tty');
  var clc = require('cli-color');
  var defaultOptions = function(){
    return {
      suppressStackTrace: false
    };
  };

  // Emulate the Mocha base class a little bit
  // just to get things going

   var BaseClass = function() {
    var self = this;

    this.isatty = tty.isatty(1) && tty.isatty(2);

    this.window = {
      width : self.isatty ? (
                        process.stdout.getWindowSize ?
                        process.stdout.getWindowSize(1)[0] :
                        tty.getWindowSize()[1]
                      ) : 75
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
    var options = defaultOptions();
    if ( config && config.nyanReporter ) {
      // merge defaults
      Object.keys( options ).forEach(function(optionName){
        if ( config.nyanReporter.hasOwnProperty(optionName) ) {
          options[optionName] = config.nyanReporter[optionName];
        }
      });
    }

    var width = Base.window.width * 0.75 | 0;
    var self = this;

    self.stats;
    self.rainbowColors = self.generateColors();
    self.colorIndex = 0;
    self.numberOfLines = 4;
    self.browser_logs = {};
    self.trajectories = [[], [], [], []];
    self.nyanCatWidth = 11;
    self.trajectoryWidthMax = (width - self.nyanCatWidth);
    self.scoreboardWidth = 5;
    self.tick = 0;
    self.colors = {
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

    self.onRunStart = function (browsers) {
      Base.cursor.hide();

      self._browsers = [];
      self.browser_logs = {};
      self.browserErrors = [];
      self.allResults = {};
      self.errors = [];
      self.totalTime = 0;
      self.numberOfSlowTests = 0;
      self.numberOfBrowsers = (browsers || []).length;

      write('\n');
    };

    self.onBrowserLog = function(browser, log, type) {
      if (! self.browser_logs[browser.id]) {
        self.browser_logs[browser.id] = {
          name: browser.name,
          log_messages: []
        };
      }

      self.browser_logs[browser.id].log_messages.push(log);
    };

    self.onBrowserStart = function (browser) {
      self._browsers.push(browser);
      self.numberOfBrowsers = self._browsers.length;
    };

    self.onSpecComplete = function(browser, result) {
      self.stats = browser.lastResult;

      if (!result.success && !result.skipped) {
          var searchArray = self.errors;

          result.suite.forEach(function(suiteName, i, arr) {
            var suite = findByName(searchArray, suiteName, Suite);

            // if we reached the last suite
            // set the test information
            if (i == arr.length - 1 ) {
              suite.tests = (!suite.tests) ? [] : suite.tests;
              var test = findByName(suite.tests, result.description, Test);
              var brwsr = findByName(test.browsers, browser.name, Browser);


              if(result.log[0] !== null){
                brwsr.errors = result.log[0].split('\n');
              }

            // Otherwise, keep looping through sub-suites
            } else {
              suite.suites = (!suite.suites) ? [] : suite.suites;
              searchArray = suite.suites;
            }

          });
        // }

      }

      self.draw();
    };

    self.onRunComplete = function(browsers, results) {
      if (self.browserErrors.length) {
        var hashes = '##########'.split('');
        var rainbowify = function(val, i, arr) {
          write(self.rainbowify(val));
        };
        while (hashes.length > 0) {
          hashes.forEach(rainbowify);
          write('\n');
          hashes.pop();
        }
        self.browserErrors.forEach(function(val, i, arr) {
          write('\n');
          write(clc.red(val));
          write('\n');
        });
        while(hashes.length < 10) {
          hashes.forEach(rainbowify);
          write('\n');
          hashes.push('#');
        }
        write('\n');

      } else {
        write("\n");
        write("\n");
        write("\n");
        write("\n");
        write("\n");

        Base.cursor.show();

        if (!options.suppressStackTrace && self.errors.length) {
          write(clc.red('Failed Tests:\n'));
          printSuitesArray(self.errors, 'red');
        }

        if (self.stats) {
          printStats(self.stats);
        }

        printBrowserLogs();
      }
    };

    self.onBrowserError = function(browser, error) {
      self.browserErrors.push(error);
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

    function printBrowserLogs() {
      var printMsg = function(msg) {
        write( "    ");
        write( clc.cyan(msg) );
        write("\n");
      };

      for (var browser in self.browser_logs) {
        write( "LOG MESSAGES FOR: " + self.browser_logs[browser].name + " INSTANCE #:" + browser + "\n" );
        self.browser_logs[browser].log_messages.forEach(printMsg);
      }
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


    function printSuitesArray(errors, color) {
      var indentation = 0;
      var inc = 3; // increment amount
      var counter = 0;

      // printer for individual errors
      var printErrors = function(errors, indentation) {
        var first = true;
        indentation += inc;
        errors.forEach(function(error, i, arr) {
          write('\n');
          write( clc.right(indentation) );
          if (first) {
            write( clc[color + 'Bright'](++counter + ') ' + error) );
          } else {
            write( clc.blackBright(error.replace(/(\?.+:)/, ':')) );
          }
          first = false;
        });
      };

      // printer for suites
      var printSuites = function(arr, indentation) {
        indentation += inc;
        arr.forEach(function(el, i, arr) {
          write(clc.right(indentation));
          if ( el instanceof Suite) {
            var str = el.name;

            if ( arr === errors ) {
              write( clc.white.underline(str) );

            } else {
              write( clc.white(str) );
            }

          } else if ( el instanceof Test ) {
            write( clc[color](el.name) );

          } else if ( el instanceof Browser ) {
            write( clc.yellow(el.name) );
            printErrors(el.errors, indentation);

          }
          write('\n');
          if (el.browsers) {
            printSuites(el.browsers, indentation);
            write('\n');
          }
          if (el.tests) {
            printSuites(el.tests, indentation);
          }
          if (el.suites) {
            printSuites(el.suites, indentation);
          }
        });
      };

      printSuites(errors, indentation);

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
  };

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
})();
