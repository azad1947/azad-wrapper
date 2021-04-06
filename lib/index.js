'use strict';

/**
 * @author Azad Vishwakarma
 */

const {
    azad_wrapper,
    set_auth,
    set_base_url,
    set_config,
    set_headers,
    error_handler
}
    = require('./azad-wrapper.js');


module.exports = azad_wrapper;
module.exports.config = set_config;
module.exports.set_base_url = set_base_url;
module.exports.set_auth = set_auth;
module.exports.set_headers = set_headers;
module.exports.error_handler = error_handler;
module.exports.wrapper = azad_wrapper;