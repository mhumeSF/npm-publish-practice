'use strict';

/**
 * Return a friendly greeting.
 *
 * @param {string} [name] Optional name to greet. When omitted (or blank),
 *   greets the world.
 * @returns {string} `"Hello, world!"` or `"Hello, <name>!"`.
 */
function hello(name) {
  if (typeof name === 'string' && name.trim() !== '') {
    return `Hello, ${name.trim()}!`;
  }
  return 'Hello, world!';
}

module.exports = { hello };
