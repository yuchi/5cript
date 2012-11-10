
var path = require('path');
var fs = require('fs');

var util = require('./util');

var assets = path.join( path.dirname( fs.realpathSync( __filename ) ), '../assets' );

var HTML_TMPL = fs.readFileSync( assets + '/html_template.ejs', 'utf8' );

var BLANK = '';
var slice = Array.prototype.slice;

var htmlOptions = {
  tablemode: true
};

exports.html = html;

function joiner () {
  return slice.call(arguments).flatten().join(BLANK);
}

function strong (str) {
  return '<strong>'+str+'</strong>';
}

function html (document, options) {

  options || (options = htmlOptions);

  var nodes = document.nodes;

  var title = nodes.filter( function (node) {
    return node.type === 'title' && node.level === 1;
  })[ 0 ];

  var pieces = [];

  var buffer = [];

  var lastType;

  function flush( type ) {
    if ( buffer.length ) {
      if ( type === 'line' && options.tablemode) {
        pieces.push( '<table>', buffer, '</table>' );
      } else if ( type === 'role' ) {
        pieces.push( '<dl>', buffer, '</dl>' );
      } else {
        pieces.push( buffer );
      }
      buffer = [];
    }
  }

  nodes.each( function (node) {
    var type = node.type;

    if ( lastType !== type ) {
      flush( lastType );
      lastType = type;
    }

    buffer[ buffer.length ] =  html[ node.type ]( node, options, document );
  });

  flush( lastType );

  var content = pieces.flatten().join("\n");

  var result = HTML_TMPL
    .split('{{title}}').join(title.content)
    .split('{{content}}').join(content);

  return result;
}

html.title = function (node) {
  var level = +node.level;
  var content = node.content;
  return joiner( '<h',level,'>',content,'</h',level,'>' );
};

html.prose = function (node) {
  var content = node.content;
  return joiner( '<p>',content,'</p>' );
};

html.direction = function (node) {
  var content = node.content;
  return joiner( '<blockquote>',content,'</blockquote>' );
};

html.line = function (node, options, document) {
  var roles = node.roles;
  var content = node.content;
  if ( options.tablemode ) {
    return joiner(
      '<tr><th class="actors">',
      parseRoles(roles, document).join(', '),
      '</th><td>',
      content,
      '</td></tr>'
    );
  } else {
    return joiner(
      '<p>',
      parseRoles(roles, document).map(strong).join(' / '),
      ': ',
      content,
      '</p>'
    );
  }
}

html.role = function (node, options, document) {
  return joiner(
    '<dt>', node.role, '</dd>',
    '<dd>', node.content, '</dd>'
  );
}

function parseRoles (roles, document) {
  var aliases = document.aliases;
  return roles.map( function (role) {
    return aliases[ role ] || role;
  });
}

