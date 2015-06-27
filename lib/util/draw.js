'use strict';

var clc = require('cli-color');
var write = require('./printers').write;

function DrawUtil(shellWidth) {
  var width = shellWidth * 0.75 | 0;

  this.numberOfLines = 4;
  this.nyanCatWidth = 11;
  this.scoreboardWidth = 5;
  this.tick = 0;
  this.trajectories = [[], [], [], []];
  this.trajectoryWidthMax = (width - this.nyanCatWidth);

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

  this.drawScoreboard = function(stats) {
    write(' ' + clc.yellow(stats.total) + '\n');
    write(' ' + clc.green(stats.success) + '\n');
    write(' ' + clc.red(stats.failed) + '\n');
    write(' ' + clc.cyan(stats.skipped) + '\n');

    this.cursorUp(this.numberOfLines);
  };

  this.drawRainbow = function(){
    var self = this;

    this.trajectories.forEach(function(line) {
      write('\u001b[' + self.scoreboardWidth + 'C');
      write(line.join(''));
      write('\n');
    });

    this.cursorUp(this.numberOfLines);
  };

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

  this.cursorUp = function(n) {
    write(clc.up(n));
  };

  this.moveCursorBelowTheDrawing = function() {
    for(var i = 0; i < this.numberOfLines + 1; i++) {
      write('\n');
    }
  };
}

exports.getInstance = function(shellWidth) { return new DrawUtil(shellWidth); };
