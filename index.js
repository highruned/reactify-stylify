/**
 * Reactify Stlyify — a Browserify transform for JSX styles
 */
"use strict";

var through = require('through');
var tools = require('./lib/tools');

function stylify(filename, options) {
  options = options || {};

  var source = '';

  function write(chunk) {
    return source += chunk;
  }

  function compile() {
    // jshint -W040
    if (isJSXFile(filename, options)) {
      try {
        var output = tools.transform(source);

        this.queue(output);
      } catch (error) {throw error;
        error.name = 'ReactifyStylifyError';
        error.message = filename + ': ' + error.message;
        error.fileName = filename;
        this.emit('error', error);
      }
    } else {
      this.queue(source);
    }
    return this.queue(null);
    // jshint +W040
  }

  return through(write, compile);
}

function isJSXFile(filename, options) {
  if (options.everything) {
    return true;
  } else {
    var extensions = ['js', 'jsx']
      .concat(options.extension)
      .concat(options.x)
      .filter(Boolean)
      .map(function(ext) { return ext[0] === '.' ? ext.slice(1) : ext });
    return new RegExp('\\.(' + extensions.join('|') + ')$').exec(filename);
  }
}

module.exports = stylify;
