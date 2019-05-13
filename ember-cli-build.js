/* jshint node:true*/
/* global require, module */
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  const app = new EmberAddon(defaults, {
    babel: {
      plugins: [
        '@babel/plugin-proposal-object-rest-spread'
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
