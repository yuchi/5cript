
module.exports = fivecript;

// TODO Use options!
function fivecript (str, options) {
  var document = parser.parse( str );
  var html = render.html( document, {
    tablemode: false
  });
  return html;
}

fivecript.parser = require('./lib/parser');
fivecript.render = require('./lib/render');

