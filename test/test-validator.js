var
  Backbone = require('backbone'),
  assert = require('assert'),
  vows = require('vows'),
  suite = vows.describe('backbone-validator'),
  validator = require(__dirname + '/../index'),

  MyModel = Backbone.Model.extend({
    validate: validator.create({
      type: { equal: 'user' },
      ctime: { type: 'date' },
      firstname: { type: 'string' },
      lastname: { type: 'string', minLength: 2, maxLength: 24 },
      organisation: { type: 'string', maxLength: 24 },
      email: { type: 'email', required: true },
      url: { type: 'url' },
      an_array: { type: 'array' },
      a_non_empty_array: { type: 'array', minLength: 1 }
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
      assert.equal(er, 'Attribute "email" must be of type email and got value "not an email".');
      assert.equal(model.get('email'), undefined);
    }
  },

  'validate string maxLength failure': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.on('error', function (m, er, options) { self.callback(er, m); });
      foo.set({ organisation: 'Some very long string that won\'nt fit here!' });
    },
    'get expected error and field has not been set': function (er, model) {
      assert.ok(/maximum length/.test(er));
      assert.equal(model.get('organisation'), undefined);
    }
  },

  'string min length failure when field has both minLength and maxLength': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.on('error', function (m, er, options) { self.callback(er, m); });
      foo.set({ lastname: 'S' });
    },
    'get expected error and field has not been set': function (er, model) {
      assert.ok(/minimum length/.test(er));
      assert.equal(model.get('lastname'), undefined);
    }
  },

  'string max length failure when field has both minLength and maxLength': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.on('error', function (m, er, options) { self.callback(er, m); });
      foo.set({ lastname: 'A super long lastname or what' });
    },
    'get expected error and field has not been set': function (er, model) {
      assert.ok(/maximum length/.test(er));
      assert.equal(model.get('lastname'), undefined);
    }
  },

  'validate string min and max length together success': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.set({ lastname: 'A good lastname' });
      return foo;
    },
    'get expected error and field has not been set': function (model) {
      assert.equal(model.get('lastname'), 'A good lastname');
    }
  },

  'try to set required field to empty': {
    topic: function () {
      var self = this, foo = new MyModel({ email: 'someone@somewhere.com' });

      foo.on('error', function (model, er, options) {
        self.callback(er, model);
      });
      foo.set({ email: '' });
    },
    'get error and check that value hasnt been set': function (er, model) {
      assert.equal(er, 'Attribute "email" is required.');
      assert.equal(model.get('email'), 'someone@somewhere.com');
    }
  },

  'allow to set empty string when not required': {
    topic: function () {
      var self = this, foo = new MyModel({ firstname: 'hahaha' });

      foo.set({ firstname: ''  });
      return foo;
    },
    'empty value has been set': function (model) {
      assert.equal(model.get('firstname'), '');
    }
  },

  'allow to set date field to null when not required': {
    topic: function () {
      var foo = new MyModel({ ctime: new Date() });
      return foo.set({ ctime: null }, { error: function () { console.log(arguments); } });
    },
    'field has been set to null': function (model) {
      assert.equal(model.get('ctime'), null);
    }
  },

  'do not allow to set date field to anything that is not a date': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.set({ ctime: 'not a date' }, {
        error: function (model, er, options) {
          self.callback(er, model);
        }
      });
    },
    'get expected error': function (er, model) {
      assert.equal(er, 'Attribute "ctime" must be of type date and got value "not a date".');
      assert.equal(model.get('ctime'), undefined);
    }
  },

  'test type url (not a url)': {
    topic: function () {
      var self = this, foo = new MyModel();

      foo.set({ url: 'not a url'  }, {
        error: function (model, er, options) {
          self.callback(er, model);
        }
      });
    },
    'get expected error message': function (er, model) {
      assert.equal(er, 'Attribute "url" must be of type url and got value "not a url".');
      assert.equal(model.get('url'), undefined);
    }
  },

  'try to set an array field to something other than array': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.on('error', function (m, er) { self.callback(er, m); });
      foo.set({ an_array: 'not an array' });
    },
    'get error and field not set': function (er, model) {
      assert.ok(/type array/.test(er));
      assert.equal(model.get('an_array'), undefined);
    }
  },

  'dont allow empty array if minLength is > 0': {
    topic: function () {
      var self = this, foo = new MyModel();
      foo.on('error', function (m, er) { self.callback(er, m); });
      foo.set({ a_non_empty_array: [] });
    },
    'get error and field not set': function (er, model) {
      assert.ok(/minimum length/.test(er));
      assert.equal(model.get('an_array'), undefined);
    }
  }

});

suite.export(module);
