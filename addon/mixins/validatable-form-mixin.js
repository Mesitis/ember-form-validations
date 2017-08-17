import Ember from 'ember';
import { FORM_ERRORS } from 'canopy-fresh/dictionary';

const { Mixin } = Ember;

export default Mixin.create({

  // returns status of `client` or `server` form errors
  currentFormErrorStatus(type) {
    const currentClientErrors = Object.values(this.get(`${type}FormErrors`));
    return currentClientErrors.some(error => error) ? 'error' : null;
  },

  updateFormStatus() {
    this.setProperties({
      serverFormErrorStatus : this.currentFormErrorStatus('server'),
      clientFormErrorStatus : this.currentFormErrorStatus('client')
    });
  },

  afterClearingFieldError() {},
  afterSettingFieldError() {},

  __afterClearingFieldError() {
    this.afterClearingFieldError();
    this.updateFormStatus();
  },

  __afterSettingFieldError() {
    this.afterSettingFieldError();
    this.updateFormStatus();
  },

  actions: {

    clearFieldError(field) {
      const clientFormErrors = this.get('clientFormErrors');
      clientFormErrors.set(field, null);
      this.__afterClearingFieldError(field);
    },

    setFieldError(field) {
      const clientFormErrors = this.get('clientFormErrors');
      let errorMessage = null;
      if (!this.get(`${field}Valid`)) { errorMessage = this.get('errors')[field] }
      clientFormErrors.set(field, errorMessage);
      this.__afterSettingFieldError(field, errorMessage);
    }
  }

});
