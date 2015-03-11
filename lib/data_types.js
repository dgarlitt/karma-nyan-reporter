exports.Browser = function Browser(name) {
  this.name = name;
  this.errors = [];
}

exports.Test = function Test(name) {
  this.name = name;
  this.browsers = [];
}

exports.Suite = function Suite(name) {
  this.name = name;
}
