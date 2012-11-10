
var fs = require('fs');
var program = require('commander');

var parser = require('./parser');
var render = require('./render');

program.parse(process.argv);

var files = program.args;


function renderFile ( path ) {

  fs.readFile( path, 'utf8', function ( err, str ) {

    if (err) throw err;

    var nodes = parser.parse( str );
    var html = render.html( nodes );

    /*console.dir( nodes );*/
    console.log( html );

  });

}


function run () {

  files.forEach( renderFile );

}


exports.run = run;

