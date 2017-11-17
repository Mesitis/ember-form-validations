import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { begin, end, next } from '@ember/runloop';
import { on } from '@ember/object/evented';
import { assign, clone, forOwn, isArray, isEmpty, keys, omit, pick, sortBy } from 'lodash';

export default Mixin.create({

  validations: {},

  errors: {},

  /**
   * Returns all errors in the form of a flat array of objects
   */
  errorsArray: computed('errors', function() {
    let errors = [];
    forOwn(this.get('errors'), (errorMessages, attributeName) => {
      if (isArray(errorMessages)) {
        for (const errorMessage of errorMessages) {
          errors.push({
            attribute : attributeName,
            message   : errorMessage
          });
        }
      }
    });
    return sortBy(errors, ['attribute', 'message']);
  }),

  /**
   * True if the form contains no errors.
   * (ie. all fields pass validation)
   */
  isFormValid: computed('errorsArray.[]', function() {
    const isValid = isEmpty(this.get('errorsArray'));

    if (this.get('validatableAttributes').length > 0 && !this.get('validationsHaveRun')) {
      return false;
    }

    // Calling the hook in the next iteration of the run-loop
    // since the computed property `isFormValid` will update only after the current run-loop iteration.
    // This is to ensure the properties' values are in sync with the hooks being called
    next(() => {
      if (isValid) {
        this.onFormValid();
      } else {
        this.onFormInvalid();
      }
    });
    return isValid;
  }),

  /**
   * An array of attributes that have a validation rule
   */
  validatableAttributes: computed('validations', function() {
    return keys(this.get('validations') || {});
  }),

  /**
   * Validate an attribute based on the defined rule
   *
   * @param attributeName {string} The name of the attribute to validate
   * @param firstError {boolean} Show only one error per attribute
   * @private
   */
  async _validateAttribute(attributeName, firstError = true) {
    if (!this.get('validatableAttributes').includes(attributeName)) {
      return;
    }
    let result = await (new Promise(resolve => {
      validate
        .async(
          this.getProperties(attributeName),
          pick(this.get('validations'), attributeName),
          {
            fullMessages: false
          }
        )
        .then(() => resolve())
        .catch(errors => resolve(errors[attributeName]));
    }));
    this.set('validationsHaveRun', true);
    if (result) {
      this.setErrors(attributeName, firstError ? result[0] : result);
    } else {
      this._resetValidation(attributeName);
    }
  },

  /**
   * Reset the validation on an attribute
   *
   * @param attributeName {string} The name of the attribute to reset
   * @private
   */
  _resetValidation(attributeName) {
    let currentErrors = clone(this.get('errors'));
    this.beforeClearingFieldError(attributeName, currentErrors[attributeName]);
    this.set(
      'errors',
      omit(
        currentErrors,
        attributeName
      )
    );
    this.afterClearingFieldError(attributeName);
  },

  /**
   * Add an error to an attribute
   *
   * @param attributeName {string} The name of the attribute to set an error to
   * @param error {string} The error to set
   */
  addError(attributeName, error) {
    if (isEmpty(error)) {
      return;
    }
    const currentErrors = this.get('errors');
    this.setErrors(attributeName, (currentErrors[attributeName] || []).concat([error]));
  },

  /**
   * Replace the errors of an attribute
   *
   * @param attributeName {string} The name of the attribute to set the errors to
   * @param errors {string[]|string} An array of errors
   */
  setErrors(attributeName, errors) {
    if (isEmpty(errors)) {
      this._resetValidation(attributeName);
      return;
    }
    let currentErrors = clone(this.get('errors'));
    this.beforeSettingFieldError(attributeName, currentErrors[attributeName]);
    currentErrors[attributeName] = isArray(errors) ? errors : [errors];
    this.set('errors', currentErrors);
    this.afterSettingFieldError(attributeName, currentErrors[attributeName]);
  },

  async validateForm() {
    // To ensure all the validations occur within a single run-loop.
    begin();
    for (const attributeName of this.get('validatableAttributes')) {
      await this._validateAttribute(attributeName);
    }
    end();
  },

  actions: {
    /**
     * Validate/Revalidate/Reset a field based on the event
     *
     * @param attributeName {string} The name of the attribute
     */
    validateField(attributeName) {
      if (['keypress', 'blur', 'input', 'change'].includes(event.type)) {
        // Running in the next run-loop iteration so that the attribute value is updated during validation
        next(() => {
          this._validateAttribute(attributeName);
        });
      } else {
        this._resetValidation(attributeName);
      }
    },

    onValid(action) {
      this.validateForm()
        .then(() => {
          next(() => {
            if (this.get('isFormValid')) {
              action();
            }
          });
        }).catch(console.error);
    }
  },

  /**
   * Initialize the validation rules on object init
   */
  _init: on('init', function() {
    if (this.get('getValidations')) {
      this.set('validations', this.getValidations());
    }
  }),

  beforeSettingFieldError(attributeName, errors) { },
  afterSettingFieldError(attributeName, errors) { },

  beforeClearingFieldError(attributeName, errors) { },
  afterClearingFieldError(attributeName) { },

  onFormValid() { },
  onFormInvalid() { }
});
