/**
 * This module provides the input configuration for promzard.  It is evaluated
 * with the nik'd package.json as context.
 */

/* global prompt, name */

/**
 * Name for new package.  Must be provided in promzard context.
 * @type {string}
 */
exports.name = prompt('name', name);

/**
 * Package description.  Defaults to nik'd package description.
 * @type {string}
 */
exports.description = prompt('description', '');

/**
 * Package version.
 * @type {string}
 */
exports.version = prompt('version', '0.0.0');
