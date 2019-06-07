import isBoolean from 'lodash-es/isBoolean';
import isFunction from 'lodash-es/isFunction';
import isObjectLike from 'lodash-es/isObjectLike';
import validate from 'validate.js';

/**
 * A custom validator to which you pass your own method to check validity
 *
 * @param value
 * @param options
 * @param key
 * @param attributes
 * @return {*}
 */
export const custom = (value, options, key, attributes) => {
  return new validate.Promise(async function(resolve) {
    try {
      const result = await options.executor(value, key, attributes);
      if (isBoolean(result) && result === true) {
        resolve();
      } else {
        if (isObjectLike(result)) {
          resolve(result.error || result.message || options.message || JSON.stringify(result));
        } else {
          resolve(result || options.message);
        }
      }
    } catch (errorResult) {
      if (isObjectLike(errorResult)) {
        resolve(errorResult.error || errorResult.message || options.message || JSON.stringify(errorResult));
      } else {
        resolve(errorResult || options.message);
      }
    }
  });
};


export const customIndicative = (data, field, message, args, get) => {
  return new Promise(async function(resolve, reject) {
    if (!args || args.length === 0 || !isFunction(args[0])) {
      return resolve();
    }
    try {
      const result = await args[0](get(data, field), field, message);
      if (isBoolean(result) && result === true) {
        resolve();
      } else {
        if (isObjectLike(result)) {
          reject(result.error || result.message || message || JSON.stringify(result));
        } else {
          reject(result || message);
        }
      }
    } catch (errorResult) {
      if (isObjectLike(errorResult)) {
        reject(errorResult.error || errorResult.message || message || JSON.stringify(errorResult));
      } else {
        reject(errorResult || message);
      }
    }
  });
};
