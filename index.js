// backbone-validator.js 0.1.0
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

  validator.VERSION = '0.1.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._,
  Backbone = root.Backbone;
  if (!_ && (typeof require !== 'undefined')) { _ = require('underscore'); }
  if (!Backbone && (typeof require !== 'undefined')) { Backbone = require('backbone'); }

  // Regular expressions for special string types.
  validator.REGEXP_EMAIL = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  validator.REGEXP_URL = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/;
  validator.REGEXP_DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,4}(\.[a-z]{2-4})?/i;

  // A type function does not describe the error
  // it merely returns a truthy / falsey value
  // The type rule uses these functions to determine
  // whether it should respond with an error msg
  validator.type = {
    'boolean': _.isBoolean,
    number:    _.isNumber,
    string:    _.isString,
    date:      _.isDate,
    array:     _.isArray,
    email:     _.bind(validator.REGEXP_EMAIL.test, validator.REGEXP_EMAIL),
    url:       _.bind(validator.REGEXP_URL.test, validator.REGEXP_URL),
    domain:    _.bind(validator.REGEXP_DOMAIN.test, validator.REGEXP_DOMAIN)
  };
  validator.type.model = function (v) {
    return v instanceof Backbone.Model;
  };
  validator.type.collection = function (v) {
    return v instanceof Backbone.Collection;
  };

  // A helper function to figure out if a value is "something".
  function isSomething(v) {
    return (!_.isUndefined(v) && !_.isNull(v) && v !== '');
  }

  // Validate a value against a set of rules.
  function validateAttr(name, value, schema) {
    var rule, msg;
    for (rule in schema) {
      if (schema.hasOwnProperty(rule) &&
          _.isFunction(validator.rules[rule]) &&
          (msg = validator.rules[rule](name, value, schema[rule]))) {
        return schema.msg || msg;
      }
    }
  }

  // Validation rules.
  validator.rules = {

    // This just checks whether a value is "something".
    required: function (name, v, options) {
      if (!isSomething(v)) { return '"' + name + '" is required.'; }
    },

    equal: function (name, v, options) {
      if (v !== options) {
        return '"' + name + '" must be equal to "' + options +
               '" and got "' + v + '".';
      }
    },

    regexp: function (name, v, options) {
      if (_.isRegExp(options)) {
        if (!options.test(v)) {
          return '"' + name + '" didn\'t match regexp. (got: "' + v + '")';
        }
      }
    },

    oneOf: function (name, v, options) {
      if (_.indexOf(options, v) === -1) {
        return '"' + name + '" must be one of "' +
               options.join(', ') + '" and got "' + v + '" instead.';
      }
    },

    type: function (name, v, type) {
      var msg = '"' + name + '" must be of type ' + type +
                ' and got value "' + v + '".';

      if (!isSomething(v)) { return; }

      var typefunc = validator.type[type];
      if (!typefunc ||
         !typefunc(v)) {
        return msg;
      }
    },

    minLength: function (name, v, options) {
      if (!_.isString(v) && !_.isArray(v)) {
        return name + ' is not a String or Array';
      }
      if (v.length < options) {
        return '"' + name + '" was expected to have a minimum ' +
               'length of ' + options + '.';
      }
    },

    maxLength: function (name, v, options) {
      if (!_.isString(v) && !_.isArray(v)) {
        return name + ' is not a String or Array';
      }
      if (v.length > options) {
        return '"' + name + '" was expected to have a maximum ' +
                'length of ' + options;
      }
    },

    recurse: function (name, v, recurse) {
      var err;
      if (!recurse) {
        return;
      }
      if (v &&
          _.isFunction(v.validate) &&
          (err = v.validate(v.attributes)) &&
          _(err).size()) {
        return err;
      } else if (v && validator.type.collection(v)) {
        err = {};
        v.each(function (m) {
          var e = m.validate(m.attributes);
          if (e) {
            err[m.id || m.cid] = e;
          }
        });
        if (_(err).size()) {
          return err;
        }
      } else if (!v || !_.isFunction(v.validate)) {
        return '"' + name + '": has no validate method';
      }
    },

    custom: function (name, v, options) {
      if (_.isFunction(options)) {
        var msg = options(v);
        if (msg) { return msg; }
      }
    }

  };

  // This is the main public interface. This function is used to create a
  // validation function to be used on a model's `validate` property.
  validator.create = function (schema) {
    schema = schema || {};
    return function (attrs, options) {
      var k, msg, submsgs, msgs = {};
      for (k in schema) {
        if ((msg = validateAttr(k, attrs[k], schema[k]))) {
          msgs[k] = msg;
        }
      }
      if (_(msgs).size()) {
        return msgs;
      }
    };
  };

}).call(this);
