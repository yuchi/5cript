
module.exports = fivecript;

// TODO Use options!
function fivecript (str, options) {
  var document = fivecript.parser.parse( str );
  var html = fivecript.render.html( document, {
    tablemode: false
  });
  return html;
}

fivecript.parser = require('./lib/parser');
fivecript.render = require('./lib/render');

