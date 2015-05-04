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

describe('util/rainbowifier.js test suite', function() {
  var module;
  var sut;

  beforeEach(function(done) {
    module = rewire('../lib/util/rainbowifier');
    sut = module.getInstance();
    done();
  });

  afterEach(function(done) {
    module = null;
    sut = null;
    done();
  });

  describe('rainbowify - method tests', function() {

    it('should return expected colorized string for each string passed in', function() {

      var expected = [  '\u001b[38;5;154ma\u001b[0m',
                        '\u001b[38;5;154ma\u001b[0m',
                        '\u001b[38;5;154ma\u001b[0m',
                        '\u001b[38;5;184ma\u001b[0m',
                        '\u001b[38;5;184ma\u001b[0m',
                        '\u001b[38;5;214ma\u001b[0m',
                        '\u001b[38;5;214ma\u001b[0m',
                        '\u001b[38;5;208ma\u001b[0m',
                        '\u001b[38;5;208ma\u001b[0m',
                        '\u001b[38;5;202ma\u001b[0m',
                        '\u001b[38;5;203ma\u001b[0m',
                        '\u001b[38;5;203ma\u001b[0m',
                        '\u001b[38;5;198ma\u001b[0m',
                        '\u001b[38;5;198ma\u001b[0m',
                        '\u001b[38;5;199ma\u001b[0m',
                        '\u001b[38;5;163ma\u001b[0m',
                        '\u001b[38;5;164ma\u001b[0m',
                        '\u001b[38;5;128ma\u001b[0m',
                        '\u001b[38;5;128ma\u001b[0m',
                        '\u001b[38;5;93ma\u001b[0m',
                        '\u001b[38;5;93ma\u001b[0m',
                        '\u001b[38;5;57ma\u001b[0m',
                        '\u001b[38;5;63ma\u001b[0m',
                        '\u001b[38;5;63ma\u001b[0m',
                        '\u001b[38;5;33ma\u001b[0m',
                        '\u001b[38;5;33ma\u001b[0m',
                        '\u001b[38;5;39ma\u001b[0m',
                        '\u001b[38;5;39ma\u001b[0m',
                        '\u001b[38;5;45ma\u001b[0m',
                        '\u001b[38;5;44ma\u001b[0m',
                        '\u001b[38;5;44ma\u001b[0m',
                        '\u001b[38;5;49ma\u001b[0m',
                        '\u001b[38;5;49ma\u001b[0m',
                        '\u001b[38;5;48ma\u001b[0m',
                        '\u001b[38;5;84ma\u001b[0m',
                        '\u001b[38;5;83ma\u001b[0m',
                        '\u001b[38;5;119ma\u001b[0m',
                        '\u001b[38;5;118ma\u001b[0m',
                        '\u001b[38;5;154ma\u001b[0m',
                        '\u001b[38;5;154ma\u001b[0m',
                        '\u001b[38;5;190ma\u001b[0m',
                        '\u001b[38;5;184ma\u001b[0m',
                        '\u001b[38;5;154ma\u001b[0m']; //starts over on item 43

      var actual = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'.split('');

      for (var i = 0; i < actual.length; i++) {
        eq(expected[i], sut.rainbowify(actual[i]));
      }
    });

  });
});
