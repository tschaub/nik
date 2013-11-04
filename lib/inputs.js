/**
 * This module provides the input configuration for promzard.  It is evaluated
 * with the nik'd package.json as context.
 */

/* global prompt, name, description, main, license, licenses */


/**
 * Name for new package.  Must be provided in promzard context.
 * @type {string}
 */
exports.name = prompt('name', name);


/**
 * Package description.  Defaults to nik'd package description.
 * @type {string}
 */
exports.description = prompt('description', description || '');


/**
 * Package version.
 * @type {string}
 */
exports.version = prompt('version', '0.0.0');


/**
 * Package entry point.  Defaults to nik'd package entry point.
 * @type {string}
 */
exports.main = prompt('main', main || 'index.js');


// apply license or licenses for nik'd package (if either exists)
if (typeof license !== 'undefined') {
  /** @type {string|Object} */
  exports.license = license;
} else if (typeof licenses !== 'undefined') {
  /** @type {Array} */
  exports.licenses = licenses;
} else {
  /** @type {string} */
  exports.license = prompt('license', 'MIT');
}
