import { customIndicative, custom } from '../validators/custom';
import validate from 'validate.js';
import indicative from 'indicative';

export function initialize() {
  validate.Promise = Promise;
  // Load custom validators
  validate.validators.custom = custom;
  indicative.validations.custom = customIndicative;
}

export default {
  initialize
};
