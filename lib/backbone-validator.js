// backbone-validator.js 0.0.0
// (c) 2012 Lupo Montero
// Licensed under the MIT license.

/*jslint indent: 2, nomen: true, vars: true, regexp: true */
/*global window: false, _: false */

'use strict';

(function (module) {

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

  module.exports.REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  module.exports.create = function (options) {
    return function (attrs) {
      var k, v, rules, msg;

      for (k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          v = attrs[k];
          rules = options[k];

          // trim strings...
          if (_.isString(v)) { v = v.trim(); this.attributes[k] = v; }

          if (rules) {
            if (rules.type) {
              msg = 'Attribute "' + k + '" must be a of type ' + rules.type;
              switch (rules.type) {
              case 'boolean':
                if (!_.isBoolean(v)) { return new Error(msg); }
                break;
              case 'number':
                if (!_.isNumber(v)) { return new Error(msg); }
                break;
              case 'string':
                if (!_.isString(v)) { return new Error(msg); }
                break;
              case 'email':
                if (!module.exports.REGEX_EMAIL.test(v)) { return new Error(msg); }
                break;
              case 'date':
                if (_.isString(v) || _.isNumber(v)) {
                  v = new Date(v);
                  this.attributes[k] = v;
                }
                if (!_.isDate(v)) { return new Error(msg); }
                break;
              case 'array':
                if (!_.isArray(v)) { return new Error(msg); }
                break;
              }
            }

            if (rules.equal && v !== rules.equal) {
              return new Error('Attribute "' + k + '" must be equal to "' +
                               rules.equal + '".');
            }

            if (rules['enum'] && _.indexOf(rules['enum'], v) === -1) {
              return new Error('Attribute "' + k + '" must be one of "' +
                               rules['enum'].join(', ') + '" and "' + v +
                               '" was passed instead.');
            }

            if (rules.regexp && _.isRegExp(rules.regexp)) {
              if (!rules.regexp.test(v)) {
                return new Error('Attribute "' + k + '" must match regexp "' +
                                 JSON.stringify(rules.regexp) + '".');
              }
            }

            if (rules.custom && _.isFunction(rules.custom)) {
              msg = rules.custom(v);
              if (msg) { return new Error(msg); }
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
