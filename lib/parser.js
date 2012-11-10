
var util = require('./util');

var title1RE = /^=+$/g;
var title2RE = /^-+$/g;

var directionRE = /^\[[\s\S]+\]$/;
var lineRE = /^([^:]+)\s*:\s*([\s\S]+)/;
var roleRE = /^\s*\-\s*([^()]+)\s*(?:\(([^()]+)\))?\s*(?::\s*([\s\S]+))?/;

function identity (o) {
  return o;
}

function nonempty (o) {
  return o && (o.content || o.role);
}

module.exports = Parser;


function Parser (str) {
  this.roleAliases = {};
  this.str = str;
};

Parser.parse = function (str) {
  var parser = new Parser( str );
  return parser.parse();
};

Parser.prototype.parse = function () {

  var str = this.str;

  var roles = [];

  var nodes = str
    .split( /\n{2,}/g )
    .map( this.piece, this )
    .flatten()
    .filter( nonempty )
    .map( this.typize, this )
    .flatten()
    .filter( nonempty )
    .each( function (node) {
      // TODO
      if ( node.roles ) {
        roles = roles.concat( node.roles );
      }
    });

  roles = roles.unique();

  var title = nodes
    .filter( function (node) {
      return node.type === 'title' && node.level === 1;
    })[ 0 ].content;

  return {
    aliases: this.roleAliases,
    nodes: nodes,
    roles: roles,
    title: title
  };
}


Parser.prototype.piece = function (str) {

  var lines = str.split( /\n+/g );

  var match = null;
  var results = [];
  var object;

  var typed;

  function nextObject () {
    results[ results.length ] = object;
    object = {
      type: 'line',
      content: ''
    };
  }

  nextObject();

  lines.forEach( function ( line ) {

    line = line.trim();

    typed = object.type !== 'line';

    if ( title1RE.test( line ) ) {

      if (typed) throw new Error('Parse error: unexpected level 1 delimiter');
      object.type = 'title';
      object.level = 1;

      nextObject();

    } else if ( title2RE.test( line ) ) {

      if (typed) throw new Error('Parse error: unexpected level 2 delimiter');
      object.type = 'title';
      object.level = 2;

      nextObject();

    } else if ( roleRE.test( line ) ) {

      nextObject();

      object.type = 'role';
      match = line.match( roleRE );
      object.role = match[ 1 ];
      object.content = match [ 3 ];

      if ( match[ 2 ] ) {
        this.defineRoleAlias( match[ 1 ], match[ 2 ] );
      }

    } else {

      object.content += ' ' + line;

    }

  }, this );

  nextObject();

  return results;
}

Parser.prototype.typize = function (o) {

  var type = o.type;
  var role;

  o.content = o.content.trim();

  if ( type === 'title' || type === 'role') {
    return o;
  }

  if ( directionRE.test( o.content ) ) {
    o.type = 'direction';
    o.content = o.content.slice(1, -1);
    return o;
  }

  var match = lineRE.exec( o.content );

  if ( match ) {
    o.roles = match[ 1 ].trim().split( /\s*,\s*/ );
    o.content = match[ 2 ];
  } else {
    o.type = 'prose';
  }

  o.content = o.content
    .split( '[' ).join( '<em>[' )
    .split( ']' ).join( ']</em>' );

  return o;
}

Parser.prototype.defineRoleAlias = function (name, aliases) {
  aliases.split(/\s*,\s*/).forEach( function (alias) {
    this.roleAliases[alias] = name.trim();
  }, this );
}

