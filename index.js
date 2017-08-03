/**
 * Nik a package.
 * @param {string} pkg The package name (same syntax as `npm install`).
 * @param {string} dest The path to the destination directory.
 * @param {function(Error)} callback Called with any errors or null on success.
 */
module.exports = require('./lib/nik').nik;
