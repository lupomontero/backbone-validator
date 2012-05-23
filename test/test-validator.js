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

      // Manually fire the callback as returning "undefined" will not work...
      this.callback(foo.validate(foo.toJSON()));
    },
    'validation returns undefined': function (er) {
      assert.ok(er === undefined);
    }
  },

  'validate bad email': {
    topic: function () {
      var self = this, foo = new MyModel();

      foo.set({ email: 'not an email' }, {
        error: function (model, er, options) {
          self.callback(er, model);
        }
      });
    },
    'validation returns expected error': function (er, model) {
      assert.equal(er, 'Attribute "email" must be a of type email');
      assert.equal(model.get('email'), undefined);
    }
  }
});

suite.export(module);
