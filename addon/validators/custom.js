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
        if (result) {
          resolve();
        } else {
          reject(options.message);
        }
      })
      .catch(() => reject(options.message));
  });
};
