/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    babel: {
      plugins: [
        'transform-object-rest-spread'
      ],
      compact  : true,
      comments : false
    },
    'ember-cli-babel': {
      includePolyfill: true
    }
  });
  return app.toTree();
};
