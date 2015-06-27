[![npm version](https://badge.fury.io/js/karma-nyan-reporter.svg)](http://badge.fury.io/js/karma-nyan-reporter)
[![Build Status](https://travis-ci.org/dgarlitt/karma-nyan-reporter.svg)](https://travis-ci.org/dgarlitt/karma-nyan-reporter)
[![Coverage Status](https://coveralls.io/repos/dgarlitt/karma-nyan-reporter/badge.svg)](https://coveralls.io/r/dgarlitt/karma-nyan-reporter)
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
      suppressErrorReport: true
    }
  });
};
```

In this release
-----------
 - Significant refactor of the codebase
 - Added tests, ci, coverage
 - Added feature requested in issue [#11](https://github.com/dgarlitt/karma-nyan-reporter/issues/11) - Show total test count
