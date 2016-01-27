'use strict';

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');

chai.config.includeStack = true;
chai.use(require('sinon-chai'));

var expect = chai.expect;
var assert = chai.assert;
var eq = assert.equal;
var ok = assert.ok;

describe('nyanCat.js test suite', function() {
  var sut;
  var module;
  var configFake;
  var formatterFake;
  var drawUtilInstanceFake;
  var drawUtilFake;
  var rainbowifierInstanceFake;
  var rainbowifierFake;
  var dataStoreInstanceFake;
  var dataStoreFake;
  var dataTypesFake;
  var printersFake;
  var shellUtilFake;
  var defaultPropertyKeys;

  beforeEach(function(done) {
    configFake = {};
    formatterFake = sinon.spy();

    drawUtilInstanceFake = {
      'appendRainbow' : sinon.spy(),
      'drawScoreboard' : sinon.spy(),
      'drawRainbow' : sinon.spy(),
      'drawNyanCat' : sinon.spy(),
      'tick' : true,
      'fillWithNewlines' : sinon.spy()
    };

    drawUtilFake = {
      'getInstance' : sinon.stub()
    };

    drawUtilFake
      .getInstance
        .returns(drawUtilInstanceFake);

    rainbowifierInstanceFake = {
      'rainbowify' : sinon.spy()
    };

    rainbowifierFake = {
      'getInstance' : sinon.stub()
    };

    rainbowifierFake
      .getInstance
        .returns(rainbowifierInstanceFake);

    dataStoreInstanceFake = {
      'save' : sinon.spy(),
      'getData' : sinon.spy()
    };

    dataStoreFake = {
      'getInstance' : sinon.stub()
    };

    dataStoreFake
      .getInstance
        .returns(dataStoreInstanceFake);

    dataTypesFake = {
      'setErrorFormatterMethod' : sinon.spy(),
      'suppressErrorHighlighting' : sinon.spy()
    };

    printersFake = {
      'write' : sinon.spy(),
      'printRuntimeErrors' : sinon.spy(),
      'printTestFailures' : sinon.spy(),
      'printStats' : sinon.spy(),
      'printBrowserLogs' : sinon.spy()
    };

    shellUtilFake = {
      'window' : {
        'width' : 100
      },
      'cursor' : {
        'show' : sinon.spy(),
        'hide' : sinon.spy()
      }
    };

    defaultPropertyKeys = [
      'options', 'adapters'
    ];

    module = rewire('../lib/nyanCat');
    module.__set__('drawUtil', drawUtilFake);
    module.__set__('rainbowifier', rainbowifierFake);
    module.__set__('dataStore', dataStoreFake);
    module.__set__('dataTypes', dataTypesFake);
    module.__set__('printers', printersFake);
    module.__set__('shellUtil', shellUtilFake);
    done();
  });

  afterEach(function(done) {
    sut = null;
    module = null;
    configFake = null;
    formatterFake = null;
    drawUtilInstanceFake = null;
    drawUtilFake = null;
    dataStoreInstanceFake = null;
    dataStoreFake = null;
    dataTypesFake = null;
    printersFake = null;
    rainbowifierInstanceFake = null;
    rainbowifierFake = null;
    shellUtilFake = null;
    defaultPropertyKeys = null;
    done();
  });

  /**
   * Constructor Tests
   */

  describe('test constructor', function() {

    it('should have expected default properties', function() {
      var msg = 'my message';

      sut = new module.NyanCat(null, formatterFake, configFake);

      expect(sut).to.contain.keys(defaultPropertyKeys);
      expect(sut.options).to.not.be.an.object;
      expect(sut.options.suppressErrorReport).to.be.false;
      expect(sut.options.suppressErrorHighlighting).to.be.false;
      expect(sut.options.numberOfRainbowLines).to.eq(4);
      expect(sut.options.renderOnRunCompleteOnly).to.be.false;
      expect(sut.adapterMessages).to.be.an.array;
      expect(sut.adapterMessages).to.be.empty;
      expect(sut.adapters).to.be.an.array;
      expect(sut.adapters).to.have.length(1);
      expect(sut.adapters[0]).to.be.a.function;
      expect(dataTypesFake.setErrorFormatterMethod.calledOnce).to.be.true;
      expect(dataTypesFake.setErrorFormatterMethod.calledWithExactly(formatterFake)).to.be.true;

      sut.adapters[0](msg);
    });

    it('should set options when passed in via config', function() {
      configFake.nyanReporter = {
        'suppressErrorReport' : true,
        'suppressErrorHighlighting' : true,
        'numberOfRainbowLines' : 100,
        'renderOnRunCompleteOnly' : true,
        'someOtherOption' : 1234
      };

      sut = new module.NyanCat(null, formatterFake, configFake);

      expect(sut.options.suppressErrorReport).to.be.true;
      expect(sut.options.suppressErrorHighlighting).to.be.true;
      expect(sut.options.numberOfRainbowLines).to.eq(100);
      expect(sut.options.renderOnRunCompleteOnly).to.be.true;
      expect(sut.options.someOtherOption).to.be.undefined;
    });

    it('should suppressErrorHighlighting if option is set in config', function() {
      configFake.nyanReporter = {
        'suppressErrorHighlighting' : true
      };

      sut = new module.NyanCat(null, null, configFake);

      expect(dataTypesFake.suppressErrorHighlighting.calledOnce).to.be.true;
    });

  });

  /**
   * reset() tests
   */

  describe('test reset method', function() {
    var props;

    beforeEach(function(done) {
      sut = new module.NyanCat(null, null, configFake);

      props = {
        '_browsers' : [],
        'allResults' : {},
        'browser_logs' : {},
        'browserErrors' : [],
        'colorIndex' : 0,
        'dataStore' : dataStoreInstanceFake,
        'drawUtil' : drawUtilInstanceFake,
        'rainbowifier' : rainbowifierInstanceFake,
        'stats' : {},

        'totalTime' : 0,
        'numberOfSlowTests' : 0
      };

      done();
    });

    afterEach(function(done) {
      props = null;
      done();
    });

    it('should not have these properties before reset is called', function() {
      expect(sut).to.not.have.keys(Object.keys(props));
    });

    it('should have the expected properties/values afterEach reset is called', function() {
      sut.reset();

      expect(sut).to.have.keys(Object.keys(props).concat(defaultPropertyKeys));

      for (var key in props) {
        expect(sut[key]).to.eql(props[key]);
      }
    });

    it('should call dataStoreFake.getInstance()', function() {
      sut.reset();
      expect(dataStoreFake.getInstance.calledOnce).to.be.true;
    });

  });

  /**
   * onRunStart() tests
   */

  describe('onRunStart method tests', function() {
    var resetSpy;

    beforeEach(function(done) {
      resetSpy = sinon.spy(module.NyanCat.prototype, 'reset');

      sut = new module.NyanCat(null, null, configFake);

      done();
    });

    afterEach(function(done) {
      resetSpy = null;
      done();
    });

    it('should call the expected methods', function() {
      sut.onRunStart();

      expect(shellUtilFake.cursor.hide.calledOnce).to.be.true;
      expect(resetSpy.calledOnce).to.be.true;
      expect(printersFake.write.calledOnce).to.be.true;
      expect(printersFake.write.calledWithExactly('\n')).to.be.true;
    });

    it('should set numberOfBrowsers to 0', function() {
      sut.onRunStart();

      expect(sut.numberOfBrowsers).to.eq(0);
    });

    it('should set numberOfBrowsers to length of browsers arg', function() {
      sut.onRunStart(['1', '2', '3']);

      expect(sut.numberOfBrowsers).to.eq(3);
    });

  });

  /**
   * onBrowserLog() tests
   */

  describe('onBrowserLog method tests', function() {
    var browser1;
    var browser2;
    var log1;
    var log2;

    beforeEach(function(done) {
      browser1 = {
        'id' : 'fakeBrowserId1',
        'name' : 'fakeBrowserName1'
      };

      browser2 = {
        'id' : 'fakeBrowserId2',
        'name' : 'fakeBrowserName2'
      };

      log1 = 'log message 1';
      log2 = 'log message 2';

      sut = new module.NyanCat(null, null, configFake);
      sut.browser_logs = {};

      done();
    });

    afterEach(function(done) {
      browser1 = null;
      browser2 = null;
      log1 = null;
      log2 = null;
      done();
    });

    it('should add an entry to the browser_logs property', function() {
      sut.onBrowserLog(browser1, log1, null);

      expect(sut.browser_logs[browser1.id]).to.be.an.object;
      expect(sut.browser_logs[browser1.id].name).to.eq(browser1.name);
      expect(sut.browser_logs[browser1.log_messages]).to.be.an.array;
      expect(sut.browser_logs[browser1.id].log_messages.length).to.eq(1);
      expect(sut.browser_logs[browser1.id].log_messages[0]).to.eq(log1);
    });

    it('should add a new entry to log_messages if the browser.id exists', function() {
      sut.onBrowserLog(browser1, log1, null);
      sut.onBrowserLog(browser1, log2, null);

      var logs = sut.browser_logs[browser1.id].log_messages;

      expect(logs.length).to.eq(2);
      expect(logs[0]).to.eq(log1);
      expect(logs[1]).to.eq(log2);
    });

    it('should add a separate browser_log entry for each browser id', function() {
      sut.onBrowserLog(browser1, log1, null);
      sut.onBrowserLog(browser2, log2, null);

      var logs1 = sut.browser_logs[browser1.id].log_messages;
      var logs2 = sut.browser_logs[browser2.id].log_messages;

      expect(logs1.length).to.eq(1);
      expect(logs2.length).to.eq(1);
      expect(logs1[0]).to.eq(log1);
      expect(logs2[0]).to.eq(log2);
    });
  });

  /**
   * onSpecComplete() tests
   */

  describe('onSpecComplete method tests', function() {
    var browser;
    var result;

    beforeEach(function(done) {
      browser = {
        'lastResult' : 'last result'
      };

      result = {};

      sut = new module.NyanCat(null, null, configFake);
      sut.dataStore = dataStoreInstanceFake;
      sut.draw = sinon.spy();
      done();
    });

    afterEach(function(done) {
      browser = null;
      result = null;
      done();
    });

    it('should set sut.stats to the value of browser.lastResult', function() {
      sut.onSpecComplete(browser, result);
      expect(sut.stats).to.eq(browser.lastResult);
    });

    it('should only call save on dataStore when suppressErrorReport is false', function() {
      sut.options.suppressErrorReport = true;
      sut.onSpecComplete(browser, result);

      expect(dataStoreInstanceFake.save.called).to.be.false;

      sut.options.suppressErrorReport = false;
      sut.onSpecComplete(browser, result);

      expect(dataStoreInstanceFake.save.calledOnce).to.be.true;
      expect(dataStoreInstanceFake.save.calledWithExactly(browser, result)).to.be.true;
    });

    it('should call the draw method with false by default', function() {
      sut.onSpecComplete(browser, result);
      expect(sut.draw.calledOnce).to.be.true;
      expect(sut.draw.calledWithExactly(false)).to.be.true;
    });

    it('should call the draw method with true if renderOnRunCompleteOnly is true', function() {
      sut.options.renderOnRunCompleteOnly = true;
      sut.onSpecComplete(browser, result);
      expect(sut.draw.calledOnce).to.be.true;
      expect(sut.draw.calledWithExactly(true)).to.be.true;
    });

  });

  /**
   * onRunComplete() tests
   */

  describe('onRunComplete method tests', function() {
    beforeEach(function(done) {
      sut = new module.NyanCat(null, null, configFake);
      sut.draw = sinon.spy();
      sut.browserErrors = [];
      sut.drawUtil = drawUtilInstanceFake;
      sut.dataStore = dataStoreInstanceFake;
      sut.stats = 'stats';
      sut.browser_logs = 'browser_logs';
      done();
    });

    it('should always call methods in the draw() method', function() {
      sut.onRunComplete();
      ok(sut.draw.calledOnce);
      ok(sut.draw.calledWithExactly());
    });

    it('should always call shellUtilFake.cursor.show()', function() {
      sut.onRunComplete();
      ok(shellUtilFake.cursor.show.calledOnce);
    });

    it('should call the expected methods when browserErrors is empty', function() {
      var duif = drawUtilInstanceFake;

      sut.onRunComplete();

      ok(duif.fillWithNewlines.calledOnce);
      ok(duif.fillWithNewlines.calledWithExactly());

      ok(printersFake.printTestFailures.calledOnce);
      ok(printersFake.printTestFailures
                        .calledWithExactly(sut.dataStore.getData(),
                                           sut.options.suppressErrorReport));

      ok(printersFake.printStats.calledOnce);
      ok(printersFake.printStats.calledWithExactly(sut.stats));

      ok(printersFake.printBrowserLogs.calledOnce);
      ok(printersFake.printBrowserLogs.calledWithExactly(sut.browser_logs));
    });

    it('should call the expected methods when borwserErrors is not empty', function() {
      sut.browserErrors.push('I\'m an error');
      sut.rainbowifier = rainbowifierInstanceFake;
      sut.onRunComplete();
      ok(printersFake.printRuntimeErrors.calledWithExactly(rainbowifierInstanceFake.rainbowify, sut.browserErrors));
    });
  });

  /**
   * onBrowserStart() tests
   */

  describe('onBrowserStart method tests', function() {
    it('should add to the _browsers array and set numberOfBrowsers to _browsers.length', function() {
      var browser1 = 'browser1';
      var browser2 = 'browser2';

      sut = new module.NyanCat(null, null, configFake);
      sut._browsers = [];
      sut.numberOfBrowsers = 0;

      sut.onBrowserStart(browser1);
      eq(1, sut._browsers.length);
      eq(browser1, sut._browsers[0]);
      eq(sut._browsers.length, sut.numberOfBrowsers);

      sut.onBrowserStart(browser2);
      eq(2, sut._browsers.length);
      eq(browser2, sut._browsers[1]);
      eq(sut._browsers.length, sut.numberOfBrowsers);
    });
  });

  /**
   * onBrowserError() tests
   */

  describe('onBrowserError method tests', function() {
    it('should add to the browserErrors property', function() {
      var browser = 'browser';
      var error = 'error';

      sut = new module.NyanCat(null, null, configFake);
      sut.browserErrors = [];

      sut.onBrowserError(browser, error);
      expect(sut.browserErrors.length).to.eq(1);
      expect(sut.browserErrors[0]).to.eql({'browser': browser, 'error': error});
    });
  });

  /**
   * draw() tests
   */

  describe('draw method tests', function() {
    var util;

    beforeEach(function(done) {
      sut = new module.NyanCat(null, null, configFake);
      util = sut.drawUtil = drawUtilInstanceFake;
      done();
    });

    it('should call all methods and negate the tick property ' +
       'when appendOnly is false or absent', function() {
      sut.draw(false);
      expect(util.appendRainbow.calledOnce).to.be.true;
      expect(util.drawScoreboard.calledOnce).to.be.true;
      expect(util.drawRainbow.calledOnce).to.be.true;
      expect(util.drawNyanCat.calledOnce).to.be.true;
      expect(util.tick).to.be.false;

      sut.draw();
      expect(util.appendRainbow.calledTwice).to.be.true;
      expect(util.drawScoreboard.calledTwice).to.be.true;
      expect(util.drawRainbow.calledTwice).to.be.true;
      expect(util.drawNyanCat.calledTwice).to.be.true;
      expect(util.tick).to.be.true;
    });

    it('should only call appendRainbow() and ' +
       'update tick when appendOnly is true', function() {
      sut.draw(true);
      expect(util.appendRainbow.calledOnce).to.be.true;
      expect(util.drawScoreboard.calledOnce).to.be.false;
      expect(util.drawRainbow.calledOnce).to.be.false;
      expect(util.drawNyanCat.calledOnce).to.be.false;
      expect(util.tick).to.be.false;
    })
  });


});
