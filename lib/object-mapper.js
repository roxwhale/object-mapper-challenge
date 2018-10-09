'use strict';

const _ = require('lodash');

/**
 * Exports
 */
// default export
function objectMapper(...args) {
    return new ObjectMapper(...args);
}
// additionnal exports
_.assign(objectMapper, {
    opts: {
        strictSource: false,
    },
    ObjectMapper,
    map(obj, mapping = { }, opts) {
        return objectMapper(mapping, opts).map(obj);
    },
});
module.exports = objectMapper;
