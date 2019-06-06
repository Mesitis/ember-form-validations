import isBoolean from 'lodash-es/isBoolean';
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
