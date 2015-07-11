'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var assert = chai.assert;
var ok = assert.ok;
var eq = assert.equal;


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

  afterEach(function(done) {
    sut = null;
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

  /**
   * saveResultToSuite method tests
   */

  describe('saveResultToSuite tests', function() {
    var ftbnFake, fbbnFake;
    var suite, result, browser;
    var test, brwsr;

    beforeEach(function(done) {
      ftbnFake = sinon.stub();
      fbbnFake = sinon.stub();

      sut.findTestByName = ftbnFake;
      sut.findBrowserByName = fbbnFake;

      suite = {depth: 0};
      browser = {name: 'The Browser'};
      result = {description: 'blah'};

      test = {browsers: []};
      brwsr = {};

      ftbnFake.withArgs([], result.description).returns(test);
      fbbnFake.withArgs(test.browsers, browser.name).returns(brwsr);

      done();
    });

    it('should call findTestByName and findBrowserByName as expected', function() {
      sut.saveResultToSuite(suite, browser, result);

      ok(ftbnFake.calledOnce);
      ok(ftbnFake.calledWithExactly([], result.description));

      ok(fbbnFake.calledOnce);
      ok(fbbnFake.calledWithExactly(test.browsers, browser.name));
    });

    it('should call findTestByName with suiteTestsFake', function() {
      var suiteTestsFake = ['abc'];
      suite.tests = suiteTestsFake;
      ftbnFake.withArgs(suiteTestsFake, result.description).returns(test);

      sut.saveResultToSuite(suite, browser, result);

      ok(ftbnFake.calledOnce);
      ok(ftbnFake.calledWithExactly(suiteTestsFake, result.description));
    });

    it('should create brwsr.errors from result.log', function() {
      result.log = ['failure01\nfailure02'];
      var expected = ['failure01', 'failure02'];

      sut.saveResultToSuite(suite, browser, result);

      assert.deepEqual(expected, brwsr.errors);
    });
  });

  /**
   * findSuiteInResult method tests
   */

  describe('findSuiteInResult tests', function() {
    var resultFake, fsbnFake, gdFake, gdResponse;
    var suiteFakeBob, suiteFakeDole;

    beforeEach(function(done) {
      resultFake = {suite: ['bob', 'dole']};
      fsbnFake = sinon.stub();
      gdFake = sinon.stub();
      gdResponse = ['bob'];
      suiteFakeBob = {suites: ['blah']};
      suiteFakeDole = {};

      sut.getData = gdFake;
      gdFake.returns(gdResponse);

      fsbnFake.withArgs(gdResponse, 'bob').returns(suiteFakeBob);
      fsbnFake.withArgs(suiteFakeBob.suites, 'dole').returns(suiteFakeDole);

      sut.findSuiteByName = fsbnFake;

      done();
    });

    it('should call sut.getData once', function() {
      sut.findSuiteInResult(resultFake);

      ok(gdFake.calledOnce);
    });

    it('should call findSuiteByName the expected number of times', function() {
      sut.findSuiteInResult(resultFake);

      eq(2, fsbnFake.callCount);
    });

    it('should call findSuiteByName with the expected args', function() {
      sut.findSuiteInResult(resultFake);

      ok(fsbnFake.firstCall.calledWithExactly(gdResponse, 'bob'));
      ok(fsbnFake.secondCall.calledWithExactly(suiteFakeBob.suites, 'dole'));
    });
  });

  /**
   * findSuiteInResult method tests
   */

  describe('findByName tests', function() {
    var arr;

    beforeEach(function(done) {
      arr = [new FakeClass('Bob Dole')];
      done();
    });

    it('should return the existing FakeClass with the matching name', function() {
      var actual = sut.findByName(arr, 'Bob Dole', FakeClass);
      eq(arr[0], actual);
      eq(1, arr.length);
    });

    it('should append a new FakeClass with the desired name when not found in arr', function() {
      var actual = sut.findByName(arr, 'Columbo', FakeClass);
      eq(2, arr.length);
      ok(actual instanceof FakeClass);
      eq('Columbo', actual.name);
    });
  });

  /**
   * findSuiteByName method tests
   */

  describe('findSuiteByName tests', function() {
    var fbnFake;

    beforeEach(function(done) {
      fbnFake = sinon.stub();
      sut.findByName = fbnFake;
      module.__set__('dt.Suite', FakeClass);
      done();
    });

    it('should call findByName with the expected params', function() {
      var arr = [], name = 'Bob Dole Suite';
      sut.findSuiteByName(arr, name);

      ok(fbnFake.calledOnce);
      ok(fbnFake.calledWithExactly(arr, name, FakeClass));
    });
  });

  /**
   * findTestByName method tests
   */

  describe('findTestByName tests', function() {
    var fbnFake;

    beforeEach(function(done) {
      fbnFake = sinon.stub();
      sut.findByName = fbnFake;
      module.__set__('dt.Test', FakeClass);
      done();
    });

    it('should call findByName with the expected params', function() {
      var arr = [], name = 'Bob Dole Test';
      sut.findTestByName(arr, name);

      ok(fbnFake.calledOnce);
      ok(fbnFake.calledWithExactly(arr, name, FakeClass));
    });
  });

  /**
   * findBrowserByName method tests
   */

  describe('findBrowserByName tests', function() {
    var fbnFake;

    beforeEach(function(done) {
      fbnFake = sinon.stub();
      sut.findByName = fbnFake;
      module.__set__('dt.Browser', FakeClass);
      done();
    });

    it('should call findByName with the expected params', function() {
      var arr = [], name = 'Bob Dole Browser';
      sut.findBrowserByName(arr, name);

      ok(fbnFake.calledOnce);
      ok(fbnFake.calledWithExactly(arr, name, FakeClass));
    });
  });

});

function FakeClass(name) {
  this.name = name;
}
