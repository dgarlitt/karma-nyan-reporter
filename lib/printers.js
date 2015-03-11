(function() {
  'use strict';

  var clc = require('cli-color');
  var dt = require('./data_types.js');
  var Shell = require('./shell_util.js');

  /**
   * printBrowserErrors - utility method
   *
   * relies on the reporter's context to print to the console
   * when a browser encounters a runtime compilation error
   */

  var printBrowserErrors = exports.printBrowserErrors = function printBrowserErrors(context) {
    if (context.rainbowify && context.browserErrors)  {
      var hashes = '##########'.split('');
      var rainbowify = function(val, i, arr) {
        write(context.rainbowify(val));
      };
      while (hashes.length > 0) {
        hashes.forEach(rainbowify);
        write('\n');
        hashes.pop();
      }
      context.browserErrors.forEach(function(errorObj, i, arr) {
        write('\n');
        write(clc.red(errorObj.browser.name));
        write('\n');
        write(clc.red(errorObj.error));
        write('\n');
      });
      while(hashes.length < 10) {
        hashes.forEach(rainbowify);
        write('\n');
        hashes.push('#');
      }
      write('\n');
    }
  }

  /**
   * printTestFailures - utility method
   *
   * relies on the reporter's context to print to the console
   * on each test failure in the test suite
   */

  var printTestFailures = exports.printTestFailures = function printTestFailures(context, suppressErrorReport) {
    write("\n");
    write("\n");
    write("\n");
    write("\n");
    write("\n");

    Shell.cursor.show();

    if (!suppressErrorReport && context.errors.length) {
      write(clc.red('Failed Tests:\n'));
      printSuitesArray(context.errors, 'red');
    }

    if (context.stats) {
      printStats(context.stats);
    }

    printBrowserLogs(context.browser_logs);
  }

  var write = exports.write = function write(string) {
    process.stdout.write(string);
  }



  // ################################################
  // private methods
  // ################################################

  /**
   * printBrowserLogs - private utility method
   *
   * prints the console messages encountered by the browser
   * during the test run (console.log, console.info, etc...)
   */

  function printBrowserLogs(browser_logs) {
    var printMsg = function(msg) {
      write( "    ");
      write( clc.cyan(msg) );
      write("\n");
    };

    for (var browser in browser_logs) {
      write( "LOG MESSAGES FOR: " + browser_logs[browser].name + " INSTANCE #:" + browser + "\n" );
      browser_logs[browser].log_messages.forEach(printMsg);
    }
  }

  /**
   * printStats - private utility method
   *
   * prints the summary of the test run
   */

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

  /**
   * printSuitesArray - private utility method
   *
   * bloated method that loops over each test error and prints
   * it to the screen in an informative manner
   */

  function printSuitesArray (errors, color) {
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

        if ( el instanceof dt.Suite ) {
          var str = el.name;

          if ( arr === errors ) {
            write( clc.white.underline(str) );

          } else {
            write( clc.white(str) );
          }

        } else if ( el instanceof dt.Test ) {
          write( clc[color](el.name) );

        } else if ( el instanceof dt.Browser ) {
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

})();
