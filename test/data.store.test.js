'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var ok = assert.ok;


describe('data/store.js - test suite', function() {
  var module, sut, fakeBrowser, fakeResult, fakeSuite;

  beforeEach(function(done) {
    module = rewire('../lib/data/store');
    sut = module.getInstance();

    fakeBrowser = {
      name: 'fake browser'
    };

    fakeResult = {
        success: false,
        skipped: false,
        suite: [1, 2, 3]
    };

    fakeSuite = {
      tests: [],
      depth: 0,
      suites: []
    };
    done();
  });

  /**
   * DataStore - class tests
   */

  describe('DataStore - class constructor tests', function() {
    it('getData returns an empty array', function() {
      var actual = sut.getData();
      assert.isArray(actual);
    });
  });

  /**
   * save method tests
   */

  describe('save tests', function() {
    var fsirFake, srtsFake;

    beforeEach(function(done) {
      fsirFake = sinon.stub();
      srtsFake = sinon.stub();

      sut.findSuiteInResult = fsirFake;
      sut.saveResultToSuite = srtsFake;
      done();
    });
    it('should call findSuiteInResult and saveResultToSuite if result.skipped ' +
       'and result.skipped are false and result.suite.length > 0', function() {
        fsirFake.withArgs(fakeResult).returns(fakeSuite);

        sut.save(fakeBrowser, fakeResult);

        ok(fsirFake.withArgs(fakeResult).calledOnce);
        ok(srtsFake.withArgs(fakeSuite, fakeBrowser, fakeResult).calledOnce);
    });

    it('should do nothing if result.success is true', function() {
        fakeResult.success = true;

        sut.save(fakeBrowser, fakeResult);

        ok(fsirFake.notCalled);
        ok(srtsFake.notCalled);
    });

    it('should do nothing if result.skipped is true', function() {
        fakeResult.skipped = true;

        sut.save(fakeBrowser, fakeResult);

        ok(fsirFake.notCalled);
        ok(srtsFake.notCalled);
    });

    it('should do nothing if result.suite.length <= 0', function() {
        fakeResult.suite = [];

        sut.save(fakeBrowser, fakeResult);

        ok(fsirFake.notCalled);
        ok(srtsFake.notCalled);
    });
  });
});
