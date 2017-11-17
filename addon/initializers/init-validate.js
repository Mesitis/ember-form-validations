import validators from '../validators';
import { assign } from 'lodash';

export function initialize() {
  // Make validate.js use Ember's Promise class for all its promises
  validate.Promise = Promise;
  // Load custom validators
  assign(validate.validators, validators);
}

export default {
  initialize
};
