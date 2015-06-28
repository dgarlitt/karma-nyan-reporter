'use strict';
var write = require('./printers').write;
var stdout = process.stdout;
var isTTY = stdout.isTTY;
var useStdout = isTTY && stdout.getWindowSize;

var ShellUtility = function() {
  var self = this;
  var winSize = useStdout ? stdout.getWindowSize(1) : [75, 4];

  this.getWidth = function() {
    return winSize[0];
  };

  this.getHeight = function() {
    return winSize[1];
  };

  this.cursor = {
    hide: function(){
      isTTY && write('\u001b[?25l');
    },

    show: function(){
      isTTY && write('\u001b[?25h');
    },

    deleteLine: function(){
      isTTY && write('\u001b[2K');
    },

    beginningOfLine: function(){
      isTTY && write('\u001b[0G');
    },

    CR: function(){
      if (isTTY) {
        self.cursor.deleteLine();
        self.cursor.beginningOfLine();
      } else {
        write('\n');
      }
    }
  };
};

exports.getInstance = function() { return new ShellUtility(); };
