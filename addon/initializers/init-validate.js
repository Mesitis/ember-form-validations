import RSVP from 'rsvp';

export function initialize() {
  // Make validate.js use Ember's Promise class for all its promises
  validate.Promise = RSVP.Promise;
}

export default {
  initialize
};
