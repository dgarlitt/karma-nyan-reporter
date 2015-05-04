'use strict';

var clc = require('cli-color');
var write = require('./printers').write;

function DrawUtil(shellWidth) {
  var width = shellWidth * 0.75 | 0;

  this.colors = {
    'fail': 31,
    'skip': 36,
    'pass': 32
  };
  this.numberOfLines = 4;
  this.nyanCatWidth = 11;
  this.scoreboardWidth = 5;
  this.tick = 0;
  this.trajectories = [[], [], [], []];
  this.trajectoryWidthMax = (width - this.nyanCatWidth);

  /**
   * Append the rainbow.
   *
   * @api private
   */

  this.appendRainbow = function(rainbowifier){
    var segment = this.tick ? '_' : '-';
    var rainbowified = rainbowifier.rainbowify(segment);

    for (var index = 0; index < this.numberOfLines; index++) {
      var trajectory = this.trajectories[index];
      if (trajectory.length >= this.trajectoryWidthMax) {
        trajectory.shift();
      }
      trajectory.push(rainbowified);
    }
  };

  /**
   * Draw the "scoreboard" showing the number
   * of passes, failures and pending tests.
   *
   * @api private
   */

  this.drawScoreboard = function(stats){
    var colors = this.colors;

    function draw(color, n) {
      write(' ');
      write('\u001b[' + color + 'm' + n + '\u001b[0m');
      write('\n');
    }

    draw(colors.pass, stats.success);
    draw(colors.fail, stats.failed);
    draw(colors.skip, stats.skipped);
    write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw the rainbow.
   *
   * @api private
   */

  this.drawRainbow = function(){
    var self = this;

    this.trajectories.forEach(function(line) {
      write('\u001b[' + self.scoreboardWidth + 'C');
      write(line.join(''));
      write('\n');
    });

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw the nyan cat
   *
   * @api private
   */

  this.drawNyanCat = function(stats) {
    var startWidth = this.scoreboardWidth + this.trajectories[0].length;
    var color = '\u001b[' + startWidth + 'C';
    var padding = '';

    write(color);
    write('_,------,');
    write('\n');

    write(color);
    padding = this.tick ? '  ' : '   ';
    write('_|' + padding + '/\\_/\\ ');
    write('\n');

    write(color);
    padding = this.tick ? '_' : '__';
    var tail = this.tick ? '~' : '^';
    write(tail + '|' + padding + this.face(stats) + ' ');
    write('\n');

    write(color);
    padding = this.tick ? ' ' : '  ';
    write(padding + '""  "" ');
    write('\n');

    this.cursorUp(this.numberOfLines);
  };

  /**
   * Draw nyan cat face.
   *
   * @return {String}
   * @api private
   */

  this.face = function(stats) {
    if (stats.failed) {
      return '( x .x)';
    } else if (stats.skipped) {
      return '( o .o)';
    } else if(stats.success) {
      return '( ^ .^)';
    } else {
      return '( - .-)';
    }
  };

  /**
   * Move cursor up `n`.
   *
   * @param {Number} n
   * @api private
   */

  this.cursorUp = function(n) {
    write(clc.up(n));
  };
}

exports.getInstance = function(shellWidth) { return new DrawUtil(shellWidth); };
