import { isBoolean, isObjectLike } from 'lodash';

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
  return new validate.Promise(function(resolve, reject) {
    Promise
      .resolve(options.executor(value, key, attributes))
      .then(result => {
        if (isBoolean(result) && result === true) {
          resolve();
        } else {
          if (isObjectLike(result)) {
            reject(result.error || result.message || options.message || JSON.stringify(result));
          } else {
            reject(result || options.message);
          }
        }
      })
      .catch(() => reject(options.message));
  });
};
