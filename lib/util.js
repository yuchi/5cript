
Array.prototype.flatten = function () {
  var obj, result = [];

  for (var i = 0, l = this.length; i < l; ++i ) {
    obj = this[ i ];
    if ( Array.isArray( obj ) ) {
      result = result.concat( obj.flatten() );
    } else {
      result[ result.length ] = obj;
    }
  }

  return result;
};

Array.prototype.each = function () {
  this.forEach.apply( this, arguments );
  return this;
}

Array.prototype.unique = function () {
  var obj,
    result = [];

  for (var i = 0, l = this.length; i < l; ++i) {
    obj = this[ i ];
    if ( result.indexOf( obj ) < 0 ) {
      result[ result.length ] = obj;
    }
  }

  return result;
}


/*Array.prototype.compact = function (iterator) {
  var result = [];
  for (var i = 0, l = this.length; i < l; ++i ) {
    if (( iterator || identity )( this[ i ] )) {
      result[ result.length ] = this[ i ];
    }
  }
  return result;
}*/

