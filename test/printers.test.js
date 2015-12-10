'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var eq = assert.equal;
var ok = assert.ok;

describe('printers.js test suite', function() {
  var sut;
  var module;
  var clcFake;

  beforeEach(function(done) {
    clcFake = {
      'red':          sinon.stub(),
      'redBright':    sinon.stub(),
      'cyan':         sinon.stub(),
      'green':        sinon.stub(),
      'right':        sinon.stub(),
      'blackBright':  sinon.stub(),
      'white':        sinon.stub(),
      'yellow':       sinon.stub()
    };

    sut = rewire('../lib/util/printers');
    sut.__set__('clc', clcFake);

    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    clcFake = null;
    done();
  });

  /**
   * printBrowserErrors() tests
   */

  describe('printRuntimeErrors method tests', function() {
    var rainbowifyFake;
    var writeFake;
    var runtimeErrors;
    var out;

    beforeEach(function(done) {
      rainbowifyFake = sinon.stub();
      rainbowifyFake.returnsArg(0);
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      runtimeErrors = [{
        'browser': {
          'name': 'browser1'
        },
        'error': 'error1'
      },{
        'browser': {
          'name': 'browser2'
        },
        'error': 'error2'
      }];

      out = '#,#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,\n,' +
            '#,#,#,#,\n,' +
            '#,#,#,\n,' +
            '#,#,\n,' +
            '#,\n,' +
            '\n,' +
            runtimeErrors[0].browser.name + ',' +
            '\n,' +
            runtimeErrors[0].error + ',' +
            '\n,' +
            '\n,' +
            runtimeErrors[1].browser.name + ',' +
            '\n,' +
            runtimeErrors[1].error + ',' +
            '\n,' +
            '\n,' +
            '#,\n,' +
            '#,#,\n,' +
            '#,#,#,\n,' +
            '#,#,#,#,\n,' +
            '#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,\n,' +
            '#,#,#,#,#,#,#,#,#,#,\n,' +
            '\n';

      out = out.split(',');

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      rainbowifyFake = null;
      runtimeErrors = null;
      writeFake = null;
      out = null;
      done();
    });

    it('should call write the expected number of times', function() {
      var hashCount = 0;
      var total = 0;

      clcFake.red.returnsArg(0);

      sut.printRuntimeErrors(rainbowifyFake, runtimeErrors);

      for (var i = 0; i < out.length; i++) {
        ++total;
        if (out[i] === '#') {
          ok(rainbowifyFake.getCall(hashCount).calledWithExactly('#'));
          ++hashCount;
        }
        ok(writeFake.getCall(i).calledWithExactly(out[i]));
      }

      eq(hashCount, rainbowifyFake.callCount);
      eq(total, writeFake.callCount);

      eq(4, clcFake.red.callCount);
      ok(clcFake.red.getCall(0).calledWithExactly(runtimeErrors[0].browser.name));
      ok(clcFake.red.getCall(1).calledWithExactly(runtimeErrors[0].error));
      ok(clcFake.red.getCall(2).calledWithExactly(runtimeErrors[1].browser.name));
      ok(clcFake.red.getCall(3).calledWithExactly(runtimeErrors[1].error));
    });
  });

  /**
   * printTestFailures() tests
   */

  describe('printTestFailures method tests', function() {

    var writeFake;

    beforeEach(function(done){
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      done();
    });

    it('should call write as expected when failedSuites is not null', function() {
      var expected1 = ' Failed Tests:\n';
      clcFake.red.withArgs(expected1).returnsArg(0);
      sut.printTestFailures([1,2,3]);
      eq(4, writeFake.callCount);
      ok(writeFake.getCall(0).calledWithExactly(expected1));
    });

    it('should NOT call write when failedSuites is empty', function() {
      sut.printTestFailures([]);
      ok(writeFake.notCalled);
    });

    it('should NOT call write when failedSuites is undefined', function() {
      sut.printTestFailures();
      ok(writeFake.notCalled);
    });

  });

  /**
   * printStats() tests
   */

  describe('printStats method tests', function() {

    var writeFake;
    var stats;
    var tab;

    beforeEach(function(done) {
      tab = '   ';
      writeFake = sinon.stub();
      writeFake.returnsArg(0);

      stats = {
        'total': 11,
        'success': 33,
        'failed': 66,
        'skipped': 99
      };

      clcFake.right.returns(tab);
      clcFake.yellow.withArgs(stats.total + ' total').returns('yellow>' + stats.total);
      clcFake.green.withArgs(stats.success + ' passed').returns('green>' + stats.success);
      clcFake.red.withArgs(stats.failed + ' failed').returns('red>' + stats.failed);
      clcFake.cyan.withArgs(stats.skipped + ' skipped').returns('cyan>' + stats.skipped);

      sut.__set__('write', writeFake);

      sut.printStats(stats);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      clcFake = null;
      done();
    });

    it('should call write the expected number of times', function() {
      eq(10, writeFake.callCount);
    });

    it('should call clc.right as expected', function() {
      eq(4, clcFake.right.callCount);
      ok(clcFake.right.firstCall.calledWithExactly(5));
      ok(clcFake.right.secondCall.calledWithExactly(3));
      ok(clcFake.right.thirdCall.calledWithExactly(3));
    });

    it('should call write with the expected arguments', function() {
      ok(writeFake.getCall(0).calledWithExactly(tab));
      ok(writeFake.getCall(1).calledWithExactly('yellow>' + stats.total));
      ok(writeFake.getCall(2).calledWithExactly(tab));
      ok(writeFake.getCall(3).calledWithExactly('green>' + stats.success));
      ok(writeFake.getCall(4).calledWithExactly(tab));
      ok(writeFake.getCall(5).calledWithExactly('red>' + stats.failed));
      ok(writeFake.getCall(6).calledWithExactly(tab));
      ok(writeFake.getCall(7).calledWithExactly('cyan>' + stats.skipped));
      ok(writeFake.getCall(8).calledWithExactly('\n'));
      ok(writeFake.getCall(9).calledWithExactly('\n'));
    });
  });

  /**
   * printBrowserLogs() tests
   */

  describe('printBrowserLogs method tests', function() {

    var writeFake;
    var fakeLogs;

    beforeEach(function(done){
      writeFake = sinon.stub();
      fakeLogs = [{
          'name' : 'browser1',
          'log_messages' : ['msg1a', 'msg1b']
        }, {
          'name' : 'browser2',
          'log_messages' : ['msg2a', 'msg2b']
      }];

      writeFake.returnsArg(0);

      sut.__set__('write', writeFake);

      done();
    });

    afterEach(function(done) {
      writeFake = null;
      fakeLogs = null;
      done();
    });

    it('should call write for each browser and 3 times for each log message', function() {
      sut.printBrowserLogs(fakeLogs);
      eq(15, writeFake.callCount);
    });

    it('should call write with the expected arguments', function() {
      var msg;
      clcFake.cyan.returnsArg(0);

      sut.printBrowserLogs(fakeLogs);

      eq(4, clcFake.cyan.callCount);

      msg = ' LOG MESSAGES FOR: browser1 INSTANCE #: 0\n';
      ok(writeFake.getCall(0).calledWithExactly(msg));
      ok(writeFake.getCall(1).calledWithExactly('    '));
      ok(writeFake.getCall(2).calledWithExactly('msg1a'));
      ok(writeFake.getCall(3).calledWithExactly('\n'));
      ok(writeFake.getCall(4).calledWithExactly('    '));
      ok(writeFake.getCall(5).calledWithExactly('msg1b'));
      ok(writeFake.getCall(6).calledWithExactly('\n'));

      msg = ' LOG MESSAGES FOR: browser2 INSTANCE #: 1\n';
      ok(writeFake.getCall(7).calledWithExactly(msg));
      ok(writeFake.getCall(8).calledWithExactly('    '));
      ok(writeFake.getCall(9).calledWithExactly('msg2a'));
      ok(writeFake.getCall(10).calledWithExactly('\n'));
      ok(writeFake.getCall(11).calledWithExactly('    '));
      ok(writeFake.getCall(12).calledWithExactly('msg2b'));
      ok(writeFake.getCall(13).calledWithExactly('\n'));
    });

  });

  /**
   * write - method tests
   */

  describe('write - method tests', function() {
    var real;

    beforeEach(function(done) {
      real = process.stdout.write;
      process.stdout.write = sinon.stub();
      process.stdout.write.returnsArg(0);

      sut.write('Hello');
      done();
    });

    afterEach(function(done) {
      process.stdout.write = real;
      done();
    });

    it('should call process.stdout.write with the expected value', function() {
      ok(process.stdout.write.calledOnce);
      ok(process.stdout.write.calledWithExactly('Hello'));
    });
  });

});
