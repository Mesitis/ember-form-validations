import Ember from 'ember';

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

  updateServerError(property, error) {
    const serverFormErrors = this.get('serverFormErrors');
    serverFormErrors.set(property, error);
    this.afterServerErrorUpdate();
  },

  updateClientError(property, error) {
    const clientFormErrors = this.get('clientFormErrors');
    clientFormErrors.set(property, error);
    this.afterClientErrorUpdate();
  },

  afterServerErrorUpdate() {},
  afterClientErrorUpdate() {},

  afterClearingFieldError() {},
  afterSettingFieldError() {},

  clearClientFormErrors() {
    const clientFormErrors = this.get('clientFormErrors');
    Object.keys(clientFormErrors).forEach(key => {
      clientFormErrors.set(key, null);
    });
    this.updateFormStatus();
  },

  clearServerFormErrors() {
    const serverFormErrors = this.get('serverFormErrors');
    Object.keys(serverFormErrors).forEach(key => {
      serverFormErrors.set(key, null);
    });
    this.updateFormStatus();
  },

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
      this.updateClientError(field, null);
      this.__afterClearingFieldError(field);
    },

    setFieldError(field) {
      let errorMessage = null;
      if (!this.get(`${field}Valid`)) { errorMessage = this.get('errors')[field] }
      this.updateClientError(field, errorMessage);
      this.__afterSettingFieldError(field, errorMessage);
    }
  }

});
