[![npm version](https://badge.fury.io/js/karma-nyan-reporter.svg)](http://badge.fury.io/js/karma-nyan-reporter)
[![Build Status](https://travis-ci.org/dgarlitt/karma-nyan-reporter.svg)](https://travis-ci.org/dgarlitt/karma-nyan-reporter)
[![Coverage Status](https://coveralls.io/repos/dgarlitt/karma-nyan-reporter/badge.svg?branch=master)](https://coveralls.io/r/dgarlitt/karma-nyan-reporter?branch=master)
<!-- [![Dependency Status](https://david-dm.org/dgarlitt/karma-nyan-reporter.svg)](https://david-dm.org/dgarlitt/karma-nyan-reporter) -->

karma-nyan-reporter
===================

Nyan Cat style reporter originally cobbled together from the [Mocha](http://visionmedia.github.io/mocha/) version

![Karma Nyan Cat Reporter for Karma](http://i.imgur.com/ZERpMgx.gif "Karma Nyan Cat Reporter for Karma")

Installation
========

Installation is simple using npm, just run the following command:

```sh
npm install --save-dev karma-nyan-reporter
```

Since this follows Karma's plugin naming convention, that's all there is to it!

Now, run your tests and enjoy:

```sh
karma start path/to/karma.conf.js --reporters nyan
```

Error and Logging Output
=========

Here is a screenshot of the error and logging output. The errors are displayed heirarchically based on the test suite and nesting level. ```console.log()``` messages are output at the bottom (in blue) below the test summary and grouped by browser.

![Karma Nyan Cat Reporter Error Output](http://i.imgur.com/addD96Z.png "Karma Nyan Cat Reporter Error Output")

Options
=========

If you want to supress the stack trace at the end of the test run you can use the suppressErrorReport option.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // normal config stuffs

    reporters: ['nyan'],

    // reporter options
    nyanReporter: {
      // suppress the error report at the end of the test run
      suppressErrorReport: true,

      // increase the number of rainbow lines displayed
      // enforced min = 4, enforced max = terminal height - 1
      numberOfRainbowLines: 100 // default is 4
    }
  });
};
```

In this release
-----------
 - Documentation fix
