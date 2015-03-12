karma-nyan-reporter
===================

Nyan Cat style reporter cobbled together from the [Mocha](http://visionmedia.github.io/mocha/) version

![alt text](https://googledrive.com/host/0BxhEGuYWG8zAWHlxTmtNbWtibEE/karma-nyan-reporter.gif "Nyan Cat Reporter for Karma")

Installation
========

Installation is simple using npm, just run the following command:

    npm install --save-dev karma-nyan-reporter

Since this follows Karma's plugin naming convention, that's all there is to it!

Now, run your tests and enjoy:

    karma start path/to/karma.conf.js --reporters nyan

Error and Logging Output
=========

Here is a screenshot of the error and logging output. The errors are displayed heirarchically based on the test suite and nesting level. ```console.log()``` messages are output at the bottom (in blue) below the test summary and grouped by browser.

![alt text](https://googledrive.com/host/0BxhEGuYWG8zAWHlxTmtNbWtibEE/karma-nyan-reporter-errors.png "Nyan Cat Reporter Error Output")

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
 - Refactored code
 - Fixed issue #6
