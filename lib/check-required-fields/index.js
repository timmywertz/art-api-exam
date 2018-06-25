const { difference, keys, curry } = require('ramda')

module.exports = curry((arrProps, obj) => difference(arrProps, keys(obj)))
