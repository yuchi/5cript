
var path = require('path');
var fs = require('fs');

var util = require('./util');

var assets = path.join( path.dirname( fs.realpathSync( __filename ) ), '../assets' );

var HTML_TMPL = fs.readFileSync( assets + '/html_template.ejs', 'utf8' );
var CSS = fs.readFileSync( assets + '/style.css', 'utf8' );

var BLANK = '';
var slice = Array.prototype.slice;

exports.html = html;

function joiner () {
  return slice.call(arguments).flatten().join(BLANK);
}

function strong (str) {
  return '<strong>'+str+'</strong>';
}

function html (document, options) {

  options || (options = {});

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
        pieces.push(
          '<dl class="roles-definition">',
          buffer,
          '</dl>'
        );
      } else {
        pieces.push( buffer );
      }
      buffer = [];
    }
  }

  nodes.each( function (node) {
    var type = node.type;
    var piece;

    if ( lastType !== type ) {
      flush( lastType );
      lastType = type;
    }

    piece = html[ node.type ]( node, options, document, parseContent( node.content ) );

    buffer[ buffer.length ] =  piece;
  });

  flush( lastType );

  var content = pieces.flatten().join("\n");

  var result = HTML_TMPL
    .split('{{title}}').join(title.content[0].text)
    .split('{{content}}').join(content)
    .split('{{style}}').join(CSS);

  return result;
}

html.title = function (node, options, document, content) {
  var level = +node.level;
  return joiner( '<h',level,'>',content,'</h',level,'>' );
};

html.prose = function (node, options, document, content) {
  return joiner( '<p>',content,'</p>' );
};

html.direction = function (node, options, document, content) {
  return joiner( '<p class="direction">[',content,']</p>' );
};

html.line = function (node, options, document, content) {
  var roles = node.roles;
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
      '<p class="line"><strong class="line-roles">',
      parseRoles(roles, document).join(' / '),
      '</strong><span>',
      content,
      '</span></p>'
    );
  }
}

html.role = function (node, options, document, content) {
  return joiner(
    '<dt class="role">', node.role, '</dd>',
    '<dd class="role-description">', content, '</dd>'
  );
}

function parseRoles (roles, document) {
  var aliases = document.aliases;
  return roles.map( function (role) {
    return aliases[ role ] || role;
  });
}

function parseContent (content) {
  return content.map( parseContentPiece );
}

function parseContentPiece (piece) {
  return contentPieces[ piece.type ]( piece );
}

var contentPieces = {

  text: function (piece) {
    return piece.text;
  },

  direction: function (piece) {
    return joiner(
      '<em class="direction">[',
      piece.text,
      ']</em>'
    );
  },

  multi: function (piece) {
    var texts = piece.texts;
    var count = texts.length;
    return joiner(
      '<span class="multi multi-',count,'"><span>',
      texts.join( '</span><span>' ),
      '</span></span>'
    );
  }

}

