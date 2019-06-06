import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { begin, end, next } from '@ember/runloop';
import validate from 'validate.js';

import set from 'lodash-es/set';
import get from 'lodash-es/get';
import keys from 'lodash-es/keys';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import clone from 'lodash-es/clone';
import forOwn from 'lodash-es/forOwn';
import filter from 'lodash-es/filter';
import sortBy from 'lodash-es/sortBy';
import isArray from 'lodash-es/isArray';
import isEmpty from 'lodash-es/isEmpty';
import throttle from 'lodash-es/throttle';
import isObject from 'lodash-es/isObject';

export default Mixin.create({

  validations: {},

  errors: {},

  validating: {},

  formAttribute: '_form',

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
    const isValid = isEmpty(
      filter(this.errorsArray, error => error.attribute !== this.formAttribute)
    );

    if (this.validatableAttributes.length > 0 && !this.validationsHaveRun) {
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
    return keys(this.validations || {});
  }),

  /**
   * True if the form has any errors to display
   */
  formHasErrors: computed('errorsArray.[]', function() {
    return !isEmpty(this.errorsArray);
  }),

  /**
   * Validate an attribute based on the defined rule
   *
   * (This is a wrapper over Validate.js's validate method to load and validate only specific
   * rules/attributes instead of validating all.)
   *
   * @param attributeName {string} The name of the attribute to validate
   * @param firstError {boolean} Show only one error per attribute
   */
  async validateAttribute(attributeName, firstError = true) {
    if (!this.validatableAttributes.includes(attributeName)) {
      return;
    }

    this.set(`validating.${attributeName}`, true);

    this.beforeValidatingField(attributeName);

    const validationRules = pick(this.validations, attributeName);
    const propertiesToValidate = [attributeName];

    // Load the data of additional properties if it is required for comparative validation
    forOwn(validationRules[attributeName], (rule, name) => {
      if (!isArray(rule) && isObject(rule)) {
        if (name === 'equality') {
          propertiesToValidate.push(rule.attribute);
        } else {
          if (rule.depends) {
            propertiesToValidate.push(rule.depends);
          }
        }
      } else if (name === 'equality') {
        propertiesToValidate.push(rule);
      }
    });

    if (validationRules[attributeName].equality) {
      let equalityCheck = validationRules[attributeName].equality;
      if (!isArray(equalityCheck) && isObject(equalityCheck)) {
        equalityCheck = equalityCheck.attribute;
      }
      propertiesToValidate.push(equalityCheck);
    }
    this.resetValidation(this.formAttribute);
    let result = await(new Promise(resolve => {
      validate
        .async(
          this.getProperties(propertiesToValidate),
          validationRules,
          {
            fullMessages    : false,
            cleanAttributes : false
          }
        )
        .then(() => resolve())
        .catch(errors => resolve(errors[attributeName]));
    }));

    this.set('validationsHaveRun', true);

    this.afterValidatingField(attributeName);

    this.set(`validating.${attributeName}`, false);

    if (result) {
      this.setErrors(attributeName, firstError ? result[0] : result);
    } else {
      this.resetValidation(attributeName);
    }
  },

  /**
   * Reset the validation on an attribute
   *
   * @param attributeName {string} The name of the attribute to reset
   */
  resetValidation(attributeName) {
    let currentErrors = clone(this.errors);
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
    const currentErrors = this.errors;
    this.setErrors(attributeName, (currentErrors[attributeName] || []).concat([error]));
  },

  /**
   * Replace the errors of an attribute
   *
   * @param attributeName {string} The name of the attribute to set the errors to
   * @param errors {string[]|string} An array of errors
   * @alias setError
   */
  setErrors(attributeName, errors) {
    if (isEmpty(errors)) {
      this.resetValidation(attributeName);
      return;
    }
    let currentErrors = clone(this.errors);
    this.beforeSettingFieldError(attributeName, currentErrors[attributeName]);
    currentErrors[attributeName] = isArray(errors) ? errors : [errors];
    this.set('errors', currentErrors);
    this.afterSettingFieldError(attributeName, currentErrors[attributeName]);
  },

  /**
   * Set an error of an attribute
   *
   * @param attributeName
   * @param error
   * @alias setErrors
   */
  setError(attributeName, error) {
    this.setErrors(...arguments);
  },

  /**
   * Set a form error
   *
   * @param error {string}
   */
  setFormError(error) {
    if (!isArray(error) && isObject(error)) {
      error = this.getErrorFromObject(error);
    }
    this.setErrors(this.formAttribute, error);
  },

  /**
   * Remove a form error
   */
  removeFormError() {
    this.resetValidation(this.formAttribute);
  },

  /**
   * Get the error message from an object
   *
   * @param error
   * @return {*}
   */
  getErrorFromObject(error) {
    if (!error) {
      return null;
    }
    return error.error ? error.error : (error.message ? error.message : error);
  },

  /**
   * Validate the entire form
   * @return {Promise.<void>}
   */
  async validateForm() {
    // To ensure all the validations occur within a single run-loop.
    begin();
    for (const attributeName of this.validatableAttributes) {
      await this.validateAttribute(attributeName);
    }
    end();
  },

  actions: {
    /**
     * Validate/Revalidate/Reset a field based on the event
     *
     * @param attributeName {string} The name of the attribute
     * @param event {Event} the DOM event associated with the action.
     */
    validateField(attributeName, event) {
      if (['keypress', 'blur', 'input', 'change'].includes(event.type)) {
        // Running in the next run-loop iteration so that the attribute value is updated during validation
        next(() => {
          this.validateAttribute(attributeName);
        });
      } else {
        this.resetValidation(attributeName);
      }
    },

    async onValid(action, revalidateForm) {
      if (revalidateForm) {
        await this.validateForm();
      }
      next(() => {
        if (this.isFormValid) {
          action();
        }
      });
    }
  },

  /**
   * Initialize the validation rules on object init
   */
  init() {
    this._super(...arguments);
    this.loadValidations();
  },

  /**
   * Load the validation rules
   */
  loadValidations() {
    const validations = this.getValidations();
    for (const attribute of keys(validations)) {
      if (get(validations, `${attribute}.custom.executor`)) {
        set(
          validations,
          `${attribute}.custom.executor`,
          throttle(
            get(validations, `${attribute}.custom.executor`),
            get(validations, `${attribute}.custom.throttle`, 1000)
          )
        );
      }
    }
    this.set('validations', validations);
  },

  /**
   * Get validation rules
   */
  getValidations() {
    return this.validations;
  },

  beforeValidatingField(attributeName) { },
  afterValidatingField(attributeName) { },

  beforeSettingFieldError(attributeName, errors) { },
  afterSettingFieldError(attributeName, errors) { },

  beforeClearingFieldError(attributeName, errors) { },
  afterClearingFieldError(attributeName) { },

  onFormValid() { },
  onFormInvalid() { }
});
