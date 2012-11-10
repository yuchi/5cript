
var util = require('./util');

var title1RE = /^=+$/g;
var title2RE = /^-+$/g;

var directionRE = /^\[[\s\S]+\]$/;
var lineRE = /^([^:]+)\s*:\s*([\s\S]+)/;
var roleRE = /^\s+\-\s+([\s\S]+)(?:\s+\(([\s\S]+)\))/;

exports.parse = parse;


function identity (o) {
  return o;
}


function parse (str) {

  var roles = [];

  var nodes = str
    .split( /\n{2,}/g )
    .map( piece )
    .flatten()
    .filter( nonempty )
    .map( typize )
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
    nodes: nodes,
    roles: roles,
    title: title
  };
}


function piece (str) {

  var lines = str.split( /\n+/g );

  var results = [];
  var object;

  var typed;

  lines.forEach( function ( line ) {

    line = line.trim();

    if ( !object ) {
      object = {
        type: 'line',
        content: ''
      };
      results[ results.length ] = object;
    }

    typed = object.type !== 'line';

    if ( title1RE.test( line ) ) {

      if (typed) throw new Error('Parse error: unexpected level 1 delimiter');
      object.type = 'title';
      object.level = 1;
      object = null;

    } else if ( title2RE.test( line ) ) {

      if (typed) throw new Error('Parse error: unexpected level 2 delimiter');
      object.type = 'title';
      object.level = 2;
      object = null;

    } else if ( line ) {

      object.content += ' ' + line;

      if ( roleRE.test( line ) ) {
        object.type = 'role';
        object = null;
      }

    }

  });

  return results;
}


function nonempty (o) {
  return o && o.content;
}


function typize (o) {

  var type = o.type;
  var role;

  o.content = o.content.trim();

  if ( type === 'title' ) {
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

