'use strict';

var tty = require('tty');
var write = require('./printers').write;

var ShellUtility = function() {
  var self = this;

  this.isatty = tty.isatty(1) && tty.isatty(2);

  this.window = {
    width : self.isatty ? (
                      process.stdout.getWindowSize ?
                      process.stdout.getWindowSize(1)[0] :
                      tty.getWindowSize()[1]
                    ) : 75
  };

  this.cursor = {
    hide: function(){
      self.isatty && write('\u001b[?25l');
    },

    show: function(){
      self.isatty && write('\u001b[?25h');
    },

    deleteLine: function(){
      self.isatty && write('\u001b[2K');
    },

    beginningOfLine: function(){
      self.isatty && write('\u001b[0G');
    },

    CR: function(){
      if (self.isatty) {
        self.cursor.deleteLine();
        self.cursor.beginningOfLine();
      } else {
        write('\n');
      }
    }
  };
};

exports.getInstance = function() { return new ShellUtility(); };
