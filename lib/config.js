'use strict';

/**
 * @author Azad Vishwakarma
 *  
 * @param {object} config 
 */

const is_url = require('is-url');
const { isEmpty } = require('lodash');

const Config = function (config = {}) {
    // only base_url, headers, auth can be set via config

    this.base_url = config.base_url ? config.base_url : null;
    this.headers = config.headers ? config.headers : null;
    this.auth = config.auth ? config.auth : null;
    this.url = null;
    this.data = {}
}

Config.prototype.set_base_url = function (url) {
    this.base_url = url;
}

Config.prototype.set_headers = function (header) {
    this.headers = header;
}

Config.prototype.set_auth = function (auth) {
    this.auth = auth;
}

Config.prototype.set_path = function (endpoint) {
    this.url = this.base_url + endpoint;
}

Config.prototype.set_url = function (url) {
    if (is_url(url)) {
        this.url = url;
    } else {
        throw new Error('url passed in the wrapper is not correct.');
    }
}

Config.prototype.set_data = function (data) {
    this.data = data;
}

Config.prototype.options = function (args, req) {
    return {
        url: args.url ? args.url : this.url,
        method: args.method ? args.method : 'GET',
        data: args.request_map ? this.data : (!isEmpty(req.body) ? req.body : null),
        auth: args.auth ? args.auth : this.auth,
        headers: args.headers ? args.headers : this.headers,
        path_params: args.path_params ? args.path_params : null,
        query_params: args.query_params ? args.query_params : null,
        response_map: args.response_map ? args.response_map : null,
        transform_response: args.transform_response ? args.transform_response : null,
        required_fields: args.required_fields ? args.required_fields : null
    }
}

module.exports = Config;