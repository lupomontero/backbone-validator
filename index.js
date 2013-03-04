// backbone-validator.js 0.0.7
// (c) 2012 Lupo Montero
// Licensed under the MIT license.

/*global window, _, require, module */

(function (module) {

  'use strict';

  var _;

  // if no module var has been set we assume we are running in the web browser,
  // otherwise we assume we are node.js
  if (!module) {
    module = { exports: {} };
    _ = window._;
  } else {
    _ = require('underscore');
  }

  if (!_) {
    throw new Error('Please make sure that underscore is loaded!');
  }

  module.exports.REGEXP_EMAIL = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  module.exports.REGEXP_URL = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/;

  module.exports.create = function (schema) {
    return function (attrs, options) {
      var k, v, rules, msg, isSomething;

      for (k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          v = attrs[k];
          rules = schema[k];
          isSomething = (!_.isUndefined(v) && !_.isNull(v) && v !== '');

          if (rules) {
            if (rules.required && !isSomething) {
              return 'Attribute "' + k + '" is required.';
            }

            if (rules.type && isSomething) {
              msg = 'Attribute "' + k + '" must be of type ' + rules.type +
                    ' and got value "' + v + '".';
              switch (rules.type) {
              case 'boolean':
                if (!_.isBoolean(v)) { return msg; }
                break;
              case 'number':
                if (!_.isNumber(v)) { return msg; }
                // TODO: Implement range for numbers.
                //if (rules.range) {}
                break;
              case 'string':
                if (!_.isString(v)) { return msg; }
                break;
              case 'email':
                if (!module.exports.REGEXP_EMAIL.test(v)) { return msg; }
                break;
              case 'url':
                if (!module.exports.REGEXP_URL.test(v)) { return msg; }
                break;
              case 'date':
                if (!_.isDate(v)) { return msg; }
                break;
              case 'array':
                if (!_.isArray(v)) { return msg; }
                break;
              }

              if (rules.type === 'string' || rules.type === 'array') {
                if (rules.minLength && v.length < rules.minLength) {
                  return [
                    'Attribute "', k, '" was expected to have a minimum ',
                    'length of ', rules.minLength, ' and the current value ("',
                    v, '") has a length of ', v.length, '.'
                  ].join('');
                }
                if (rules.maxLength && v.length > rules.maxLength) {
                  return [
                    'Attribute "', k, '" was expected to have a maximum ',
                    'length of ', rules.maxLength, ' and the current value ("',
                    v, '") has a length of ', v.length, '.'
                  ].join('');
                }
              }
            }

            if (rules.equal && v !== rules.equal) {
              return [
                'Attribute "', k, '" must be equal to "', rules.equal, '".'
              ].join('');
            }

            if (rules['enum'] && _.indexOf(rules['enum'], v) === -1) {
              return [
                'Attribute "', k, '" must be one of "',
                rules['enum'].join(', '), '" and "', v, '" was passed instead.'
              ].join('');
            }

            if (rules.regexp && _.isRegExp(rules.regexp)) {
              if (!rules.regexp.test(v)) {
                var
                  toSource = rules.regexp.toSource,
                  regexpSource = _.isFunction(toSource) ? toSource() : undefined;

                msg = 'Attribute "' + k + '" must match regexp';
                if (regexpSource) { msg += ' "' + regexpSource + '"'; }
                msg += ' and got value "' + v + '".';

                return msg;
              }
            }

            if (rules.custom && _.isFunction(rules.custom)) {
              msg = rules.custom(v);
              if (msg) { return msg; }
            }
          }
        }
      }
    };
  };

  if (typeof window === 'object') {
    window.validator = module.exports;
  }

}((typeof module === 'object') ? module : undefined));
