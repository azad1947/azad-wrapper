'use strict';

/**
 * @author Azad Vishwakarma
 */

const _ = require('lodash');
const axios = require('axios');
const Config = require('./config');
const is_url = require('is-url');
const object_mapper = require('object-mapper');

let config;

(() => {
    config = new Config({});
})();

// set config method
exports.set_config = function (_config) {
    config = new Config(_config);
}

// set base_url method
exports.set_base_url = (url) => {
    config.set_base_url(url);
}

// set headers method
exports.set_headers = function (header) {
    config.set_headers(header);
}

// set auth method
exports.set_auth = function (auth) {
    config.set_auth(auth);
}

const check_typeof_resp = function (response) {
    let resp_type = '';

    if (_.isString(response)) {
        resp_type = 'str';
    }

    if (_.isArray(response)) {
        if (_.every(response, (val) => _.isObject(val))) {
            resp_type = 'arr_of_obj';
        } else {
            resp_type = 'arr';
        }
    }

    if (!_.isArray(response) && _.isObject(response)) {
        resp_type = 'obj';
    }

    return resp_type;
}

const map_basedon_type = (type, src, map) => {
    switch (type) {
        case 'str':
            return src;
        case 'arr':
            return src;
        case 'obj':
            return object_mapper(src, map);
        case 'arr_of_obj':
            return _.reduce(src, (acc, val) => {
                const new_obj = object_mapper(val, map);
                acc.push(new_obj);
                return acc;
            }, []);
    }
}

const update_url_with_pathparam = (options, req) => {
    let path_str = '';
    options.path_params.path.split('/').forEach((val) => {
        if (val) {
            val.split(':').forEach((_val) => {
                if (_val) {
                    if (options.path_params.value_from.toLowerCase() === 'body') {
                        if (options.path_params.map) {
                            path_str += '/' + req.body[options.path_params.map[_val]]
                        } else {
                            path_str += '/' + req.body[_val]
                        }
                    }

                    if (options.path_params.value_from.toLowerCase() === 'query') {
                        if (options.path_params.map) {
                            path_str += '/' + req.query[options.path_params.map[_val]]
                        } else {
                            path_str += '/' + req.query[_val]
                        }
                    }
                }
            })
        }
    })
    options.url = options.url + path_str;
}

const update_params = (options, req) => {
    const params = {};
    options.query_params.params.forEach((val) => {

        if (options.query_params.value_from.toLowerCase() === 'body') {
            if (options.query_params.map) {
                params[val] = req.body[options.query_params.map[val]];
            } else {
                params[val] = req.body[val]
            }
        }

        if (options.query_params.value_from.toLowerCase() === 'query') {
            if (options.query_params.map) {
                params[val] = req.query[options.query_params.map[val]];
            } else {
                params[val] = req.query[val]
            }
        }
    })

    options.params = params;
}

const make_api_call = (options, req, res, next) => {

    if (options.required_fields) {
        const error = _.reduce(options.required_fields, (acc, field) => {
            if (!_.keys(req.body).includes(field)) {
                acc[field] = `${field} is required.`;
            }
            return acc;
        }, {});

        if (!_.isEmpty(error)) {
            res.status(400).json({ error: error });
            return;
        }

    }

    if (options.path_params) {
        update_url_with_pathparam(options, req);
    }

    if (options.query_params) {
        update_params(options, req);
    }

    axios(options)
        .then((response) => {
            const { data } = response;

            // if transform_response is provided then no other response_map will work.

            if (options.transform_response) {
                const transformed_resp = options.transform_response(data, req);
                res.send(transformed_resp);
                return;
            }

            if (options.response_map) {
                const typeof_resp = check_typeof_resp(data);
                const mapped_data = map_basedon_type(typeof_resp, data, options.response_map);
                res.send(mapped_data);
                return;
            }

            res.send(data)
        })
        .catch((err) => {
            console.log('error:- ', err.message);
            next(err);
        })
}

exports.azad_wrapper = (args) => {
    return (req, res, next) => {
        try {
            // check if args is a endpoint
            if (typeof args === 'string' && args.split('')[0] === '/') {
                if (!config.base_url) {
                    throw new Error('first set the base url. then pass endpoint.');
                } else {
                    config.set_path(args);
                }
            }

            // check if args is url
            if (is_url(args)) {
                config.set_url(args);
            }

            // if args is config object
            if (args instanceof Object) {
                if (args.url && !is_url(args.url)) {
                    throw new Error('url passed in the wrapper is not correct.');
                }

                if (args.method) {
                    if (!['get', 'post', 'put', 'delete'].includes(args.method.toLowerCase())) {
                        throw new Error('method name passed in the wrapper is not correct.');
                    }
                }

                if (args.endpoint) {
                    if (config.base_url) {
                        config.set_path(args.endpoint)
                    } else {
                        throw new Error('first set base_url then pass endpoint.')
                    }
                }

                if (args.request_map) {
                    const body = object_mapper(req.body, args.request_map);
                    config.set_data(body);
                }
            }

            const options = config.options(args, req);
            make_api_call(options, req, res, next);
        } catch (error) {
            next(error);
        }
    }
}

exports.error_handler = (env = 'dev', msg = 'failed to make http request. plz try again.') => {
    return (err, req, res, next) => {
        console.log('\x1b[31m', err.stack);

        const error = {
            status: err.status || 500,
        }

        if (env.toLocaleLowerCase() === 'dev') {
            error.message = err.message;
            error.stack = err.stack;
        } else {
            error.message = msg;
        }

        res.json({ error });
    }
}