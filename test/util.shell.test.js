'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var eq = assert.equal;
var ok = assert.ok;
var nok = assert.notOk;

describe('util/shell.js test suite', function() {
  var writeFake;
  var realGetWindowSize;
  var ttyFake;
  var module;
  var sut;
  var winSizeArr;

  beforeEach(function(done) {
    realGetWindowSize = process.stdout.getWindowSize;
    writeFake = sinon.stub();
    process.stdout.getWindowSize = null;
    winSizeArr = [200, 400];

    ttyFake = {
      isatty: sinon.stub(),
      getWindowSize: sinon.stub()
    };

    ttyFake.isatty.withArgs(1).returns(true);
    ttyFake.isatty.withArgs(2).returns(true);
    ttyFake.getWindowSize.returns(winSizeArr);

    module = rewire('../lib/util/shell');
    module.__set__('tty', ttyFake);
    module.__set__('write', writeFake);

    done();
  });

  afterEach(function(done) {
    writeFake = null;
    ttyFake = null;
    module = null;
    sut = null;
    winSizeArr = null;
    process.stdout.getWindowSize = realGetWindowSize;
    realGetWindowSize = null;
    done();
  });

  describe('ShellUtility constructor tests', function() {

    it('should set isatty as expected when isatty is true', function() {
      sut = module.getInstance();
      ok(sut.isatty);

      ttyFake.isatty.withArgs(1).returns(false);
      sut = module.getInstance();
      nok(sut.isatty);

      ttyFake.isatty.withArgs(2).returns(false);
      sut = module.getInstance();
      nok(sut.isatty);

      ttyFake.isatty.withArgs(1).returns(true);
      sut = module.getInstance();
      nok(sut.isatty);
    });

    it('should set window.width to tty.getWindowSize() @index 1' +
       'when isatty & process.stdout.getWindowSize does not exist', function() {
        sut = module.getInstance();
        ok(sut.isatty);
        eq(400, sut.window.width);
    });

    it('should set window.width to the expected size when isatty is false', function() {
      ttyFake.isatty.withArgs(1).returns(false);
      sut = module.getInstance();
      nok(sut.isatty);
      eq(75, sut.window.width);
    });

    it('should return process.stdout.getWindowSize(1)[0] when' +
       'proess.stdout.getWindowSize exists', function() {
        var getWindowSizeFake = sinon.stub();
        process.stdout.getWindowSize = getWindowSizeFake;
        getWindowSizeFake.withArgs(1).returns(winSizeArr);
        sut = module.getInstance();
        ok(sut.isatty);
        ok(getWindowSizeFake.calledOnce);
        ok(getWindowSizeFake.calledWithExactly(1));
        eq(200, sut.window.width);
    });
  });

  describe('cursor method tests', function() {
    var hide, show, deleteLine, beginningOfLine;

    beforeEach(function(done) {
      hide = '\u001b[?25l';
      show = '\u001b[?25h';
      deleteLine = '\u001b[2K';
      beginningOfLine = '\u001b[0G';

      sut = module.getInstance();
      done();
    });

    afterEach(function(done) {
      sut = null;
      done();
    });

    describe('cursor.hide tests', function() {
      it('should call write with the expected value', function() {
        sut.cursor.hide();
        ok(sut.isatty);
        ok(writeFake.calledOnce);
        ok(writeFake.calledWithExactly(hide));
      });

      it('should not call write', function() {
        sut.isatty = false;
        nok(sut.isatty);
        sut.cursor.hide();
        ok(writeFake.notCalled);
      });
    });

    describe('cursor.show tests', function() {
      it('should call write with the expected value', function() {
        sut.cursor.show();
        ok(sut.isatty);
        ok(writeFake.calledOnce);
        ok(writeFake.calledWithExactly(show));
      });

      it('should not call write', function() {
        sut.isatty = false;
        nok(sut.isatty);
        sut.cursor.show();
        ok(writeFake.notCalled);
      });
    });

    describe('cursor.deleteLine tests', function() {
      it('should call write with the expected value', function() {
        sut.cursor.deleteLine();
        ok(sut.isatty);
        ok(writeFake.calledOnce);
        ok(writeFake.calledWithExactly(deleteLine));
      });

      it('should not call write', function() {
        sut.isatty = false;
        nok(sut.isatty);
        sut.cursor.deleteLine();
        ok(writeFake.notCalled);
      });
    });

    describe('cursor.beginningOfLine tests', function() {
      it('should call write with the expected value', function() {
        sut.cursor.beginningOfLine();
        ok(sut.isatty);
        ok(writeFake.calledOnce);
        ok(writeFake.calledWithExactly(beginningOfLine));
      });

      it('should not call write', function() {
        sut.isatty = false;
        nok(sut.isatty);
        sut.cursor.beginningOfLine();
        ok(writeFake.notCalled);
      });
    });

    describe('CR tests', function() {
      it('should call write with \\n when isatty is false', function() {
        sut.isatty = false;
        nok(sut.isatty);
        sut.cursor.CR();
        ok(writeFake.calledOnce);
        ok(writeFake.calledWithExactly('\n'));
      });

      it('should call cursor.deleteLine and cursor.beginningOfLine when isatty', function() {
        var dlFake = sinon.stub();
        sut.cursor.deleteLine = dlFake;

        var bolFake = sinon.stub();
        sut.cursor.beginningOfLine = bolFake;

        ok(sut.isatty);

        sut.cursor.CR();

        ok(dlFake.withArgs().calledOnce);
        ok(bolFake.withArgs().calledOnce);
      });
    });
  });


});
