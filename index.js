/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-form-validations',
  isDevelopingAddon: function() {
    return true;
  },
  included(app) {
    this._super.included.apply(this, arguments);
    app.import('node_modules/@bower_components/validate/validate.min.js');
  }
};
