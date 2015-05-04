'use strict';

var rainbowColors = generateColors();

function Rainbowifier() {

  var colorIndex = 0;

  /**
   * Apply rainbow to the given `str`.
   *
   * @param {String} str
   * @return {String}
   * @api private
   */

  this.rainbowify =
        exports.rainbowify =
          function rainbowify(str) {
            var color = rainbowColors[colorIndex % rainbowColors.length];
            colorIndex += 1;
            return '\u001b[38;5;' + color + 'm' + str + '\u001b[0m';
          };
}

exports.getInstance = function() { return new Rainbowifier(); };


/**
 * Generate rainbow colors.
 *
 * @return {Array}
 * @api private
 */

function generateColors() {
  var colors = [];

  for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));
    var r = Math.floor(3 * Math.sin(n) + 3);
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
    colors.push(36 * r + 6 * g + b + 16);
  }

  return colors;
}
