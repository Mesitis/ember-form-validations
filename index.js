/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-form-validations',
  isDevelopingAddon() {
    return true;
  },
  included(app) {
    this._super.included.apply(this, arguments);
  }
};
