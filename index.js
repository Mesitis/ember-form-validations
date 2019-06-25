/* jshint node: true */
'use strict';
const path = require('path');

let libraryToTranspile = 'indicative';

module.exports = {
  name    : 'ember-form-validations',
  options : {
    autoImport: {
      webpack: {
        module: {
          rules: [
            {
              test : new RegExp('^' + path.dirname(require.resolve(libraryToTranspile + '/package.json'))),
              use  : {
                loader  : 'ember-form-validations-babel-loader',
                options : {
                  presets: [
                    ['@babel/preset-env', { targets: ['ie 11', 'last 2 versions'] }]
                  ]
                }
              }
            }
          ]
        },
        resolveLoader: {
          alias: {
            'ember-form-validations-babel-loader': require.resolve('babel-loader')
          }
        }
      }
    }
  },
  isDevelopingAddon() {
    return true;
  },
  included(app) {
    this._super.included.apply(this, arguments);
  }
};
