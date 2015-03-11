var tty = require('tty');

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
      self.isatty && process.stdout.write('\u001b[?25l');
    },

    show: function(){
      self.isatty && process.stdout.write('\u001b[?25h');
    },

    deleteLine: function(){
      self.isatty && process.stdout.write('\u001b[2K');
    },

    beginningOfLine: function(){
      self.isatty && process.stdout.write('\u001b[0G');
    },

    CR: function(){
      if (self.isatty) {
        self.cursor.deleteLine();
        self.cursor.beginningOfLine();
      } else {
        process.stdout.write('\n');
      }
    }
  };
};

module.exports = new ShellUtility();
