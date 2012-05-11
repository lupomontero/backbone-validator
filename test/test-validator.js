var
  Backbone = require('backbone'),
  assert = require('assert'),
  vows = require('vows'),
  suite = vows.describe('backbone-validator'),
  validator = require(__dirname + '/../index'),

  MyModel = Backbone.Model.extend({
    validate: validator.create({
      type: { equal: 'user' },
      firstname: { type: 'string' },
      lastname: { type: 'string' },
      email: { type: 'email' }
    })
  });

suite.addBatch({
  'validate all good': {
    topic: function () {
      var foo = new MyModel({
        type: 'user',
        firstname: 'Lupo',
        lastname: 'Montero',
        email: 'lupo@e-noise.com'
      });

      this.callback(null, foo.validate(foo.toJSON()));
    },
    'validation returns undefined': function (er, ret) {
      assert.ok(ret === undefined);
    }
  },

  'validate bad email': {
    topic: function () {
      var foo = new MyModel({
        type: 'user',
        firstname: 'Lupo',
        lastname: 'Montero',
        email: 'not an email'
      });

      this.callback(null, foo.validate(foo.toJSON()));
    },
    'validation returns undefined': function (er, ret) {
      assert.ok(ret.message === 'Attribute "email" must be a of type email');
    }
  }
});

suite.export(module);
