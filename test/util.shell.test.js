'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var eq = assert.equal;
var ok = assert.ok;

describe('util/shell.js test suite', function() {
  var module;
  var sut;
  var fakeWrite;
  var fakeStdout;
  var fakeWinSize;
  var expected, actual;

  beforeEach(function(done) {
    fakeWrite = sinon.stub();

    fakeStdout = {
      getWindowSize: sinon.stub()
    };

    fakeWinSize = [200, 100];
    fakeStdout.getWindowSize.withArgs(1).returns(fakeWinSize);

    module = rewire('../lib/util/shell');
    module.__set__('write', fakeWrite);
    module.__set__('stdout', fakeStdout);
    module.__set__('isTTY', true);
    module.__set__('useStdout', true);

    done();
  });

  afterEach(function(done) {
    module = null;
    sut = null;
    fakeStdout = null;
    fakeWinSize = null;
    expected = null;
    actual = null;
    done();
  });

  describe('ShellUtility getWidth & getHeight method tests', function() {
    it('should use stdout.getWindowSize(1) when useStdout is true', function() {
      sut = module.getInstance();
      eq(fakeWinSize[0], sut.getWidth());
      eq(fakeWinSize[1], sut.getHeight());
    });

    it('should use alternative when useStdout is false', function() {
      module.__set__('useStdout', false);
      sut = module.getInstance();
      eq(75, sut.getWidth());
      eq(4, sut.getHeight());
    });
  });

  describe('cursor method tests', function() {
    var hide, show, deleteLine, beginningOfLine;

    beforeEach(function(done) {
      hide = '\u001b[?25l';
      show = '\u001b[?25h';
      deleteLine = '\u001b[2K';
      beginningOfLine = '\u001b[0G';
      done();
    });

    afterEach(function(done) {
      sut = null;
      done();
    });

    describe('when isTTY is true', function() {
      beforeEach(function(done) {
        sut = module.getInstance();
        done();
      });

      describe('cursor.hide tests', function() {
        it('should call write with the expected value', function() {
          sut.cursor.hide();
          ok(fakeWrite.calledOnce);
          ok(fakeWrite.calledWithExactly(hide));
        });
      });

      describe('cursor.show tests', function() {
        it('should call write with the expected value', function() {
          sut.cursor.show();
          ok(fakeWrite.calledOnce);
          ok(fakeWrite.calledWithExactly(show));
        });
      });

      describe('cursor.deleteLine tests', function() {
        it('should call write with the expected value', function() {
          sut.cursor.deleteLine();
          ok(fakeWrite.calledOnce);
          ok(fakeWrite.calledWithExactly(deleteLine));
        });
      });

      describe('cursor.beginningOfLine tests', function() {
        it('should call write with the expected value', function() {
          sut.cursor.beginningOfLine();
          ok(fakeWrite.calledOnce);
          ok(fakeWrite.calledWithExactly(beginningOfLine));
        });
      });

      describe('CR tests', function() {
        it('should call cursor.deleteLine and cursor.beginningOfLine', function() {
          var dlFake = sinon.stub();
          sut.cursor.deleteLine = dlFake;

          var bolFake = sinon.stub();
          sut.cursor.beginningOfLine = bolFake;

          sut.cursor.CR();

          ok(dlFake.withArgs().calledOnce);
          ok(bolFake.withArgs().calledOnce);
        });
      });
    });

    describe('when isTTY is false', function() {
      beforeEach(function(done) {
        module.__set__('isTTY', false);
        sut = module.getInstance();
        done();
      });

      describe('cursor.hide tests', function() {
        it('should not call write', function() {
          sut.cursor.hide();
          ok(fakeWrite.notCalled);
        });
      });

      describe('cursor.show tests', function() {
        it('should not call write', function() {
          sut.cursor.show();
          ok(fakeWrite.notCalled);
        });
      });

      describe('cursor.deleteLine tests', function() {
        it('should not call write', function() {
          sut.cursor.deleteLine();
          ok(fakeWrite.notCalled);
        });
      });

      describe('cursor.beginningOfLine tests', function() {
        it('should not call write', function() {
          sut.cursor.beginningOfLine();
          ok(fakeWrite.notCalled);
        });
      });

      describe('CR tests', function() {
        it('should call write with \\n', function() {
          sut.cursor.CR();
          ok(fakeWrite.calledOnce);
          ok(fakeWrite.calledWithExactly('\n'));
        });
      });
    });

  });

});
