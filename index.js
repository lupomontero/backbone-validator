// backbone-validator.js 0.0.9
// (c) 2013 Lupo Montero
// Licensed under the MIT license.

(function () {

  // Reference to global object.
  var root = this;

  // Top level namespace.
  var validator;
  if (typeof exports !== 'undefined') {
    validator = exports;
  } else {
    validator = root.validator = {};
  }

  validator.VERSION = '0.0.9';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) { _ = require('underscore'); }

  // Regular expressions for special string types.
  validator.REGEXP_EMAIL = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  validator.REGEXP_URL = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/;
  validator.REGEXP_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,4}(\.[a-z]{2-4})?/i;

  // A helper function to figure out if a value is "something".
  function isSomething(v) {
    return (!_.isUndefined(v) && !_.isNull(v) && v !== '');
  }

  // Validate a value against a set of rules.
  function validateAttr(name, value, schema) {
    var rule, msg;
    for (rule in schema) {
      if (schema.hasOwnProperty(rule) && _.isFunction(rules[rule])) {
        msg = rules[rule](name, value, schema[rule]);
        if (msg) { return msg; }
      }
    }
  }

  // Validation rules.
  var rules = {

    // This just checks whether a value is "something".
    required: function (name, v, options) {
      if (!isSomething(v)) { return 'Attribute "' + name + '" is required.'; }
    },

    equal: function (name, v, options) {
      if (v !== options) {
        return 'Attribute "' + name + '" must be equal to "' + options +
               '" and got "' + v + '".';
      }
    },

    regexp: function (name, v, options) {
      if (_.isRegExp(options)) {
        if (!options.test(v)) {
          return 'Attribute "' + name + '" didn\'t match regexp. (got: "' + v + '")';
        }
      }
    },

    oneOf: function (name, v, options) {
      if (_.indexOf(options, v) === -1) {
        return 'Attribute "' + name + '" must be one of "' +
               options.join(', ') + '" and got "' + v + '" instead.';
      }
    },

    type: function (name, v, options) {
      var msg = 'Attribute "' + name + '" must be of type ' + options +
                ' and got value "' + v + '".';

      if (!isSomething(v)) { return; }

      var condition;
      switch (options) {
        case 'boolean' : condition = _.isBoolean(v);                  break;
        case 'number'  : condition = _.isNumber(v);                   break;
        case 'string'  : condition = _.isString(v);                   break;
        case 'date'    : condition = _.isDate(v);                     break;
        case 'array'   : condition = _.isArray(v);                    break;
        case 'email'   : condition = validator.REGEXP_EMAIL.test(v);  break;
        case 'url'     : condition = validator.REGEXP_URL.test(v);    break;
        case 'domain'  : condition = validator.REGEXP_DOMAIN.test(v); break;
      }

      if (!condition) { return msg; }
    },

    minLength: function (name, v, options) {
      if (!_.isString(v) && !_.isArray(v)) { return; }
      if (v.length < options) {
        return 'Attribute "' + name + '" was expected to have a minimum ' +
               'length of ' + options + ' and the current value ("' + v + '")' +
               'has a length of ' + v.length + '.';
      }
    },

    maxLength: function (name, v, options) {
      if (v.length > options) {
        return  'Attribute "' + name + '" was expected to have a maximum ' +
                'length of ' + options + ' and the current value ("' + v +
                '") has a length of ' + v.length + '.';
      }
    },

    custom: function (name, v, options) {
      if (_.isFunction(options)) {
        msg = options(v);
        if (msg) { return msg; }
      }
    }

  };

  // This is the main public interface. This function is used to create a
  // validation function to be used on a model's `validate` property.
  validator.create = function (schema) {
    schema = schema || {};
    return function (attrs, options) {
      var k, msg;
      for (k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          msg = validateAttr(k, attrs[k], schema[k]);
          if (msg) { return msg; }
        }
      }
    };
  };

}).call(this);
