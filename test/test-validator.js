/*globals require, exports */

var
  Backbone = require('backbone'),
  validator = require('../index'),

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

exports.validateAllGood = function (t) {
  var foo = new MyModel({
    type: 'user',
    firstname: 'Lupo',
    lastname: 'Montero',
    email: 'lupo@e-noise.com'
  });

  t.ok(true); // FIXME!!!
  t.done();
};

exports.validateBadEmail = function (t) {
  var m = new MyModel();

  m.on('invalid', function (m, err) {
    t.equal(m.get('email'), undefined);
    t.equal(err, 'Attribute "email" must be of type email and got value "not an email".');
    t.done();
  });

  m.set({ email: 'not an email' }, { validate: true });
};

exports.validateStringMaxLengthFailure = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err));
    t.equal(m.get('organisation'), undefined);
    t.done();
  });

  m.set({
    organisation: 'Some very long string that won\'nt fit here!'
  }, { validate: true });
};

exports.stringMinLengthFailureWithBothMinAndMaxLength = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/minimum length/.test(err));
    t.equal(m.get('lastname'), undefined);
    t.done();
  });
  m.set({ lastname: 'S' }, { validate: true });
};

exports.stringMaxLengthFailureWithBothMinAndMaxLength = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err));
    t.equal(m.get('lastname'), undefined);
    t.done();
  });
  m.set({ lastname: 'A super long lastname or what' }, { validate: true });
};

exports.validateStringMinAndMaxLengthTogetherSuccess = function (t) {
  var m = new MyModel();
  m.on('change', function () {
    t.equal(m.get('lastname'), 'A good lastname');
    t.done();
  });
  m.set({ lastname: 'A good lastname' }, { validate: true });
};

exports.tryToSetRequiredFieldToEmptyString = function (t) {
  var m = new MyModel({ email: 'someone@somewhere.com' });
  m.on('invalid', function (m, err) {
    t.equal(err, 'Attribute "email" is required.');
    t.equal(m.get('email'), 'someone@somewhere.com');
    t.done();
  });
  m.set({ email: '' }, { validate: true });
};

exports.allowToSetEmptyStringWhenNotRequired = function (t) {
  var m = new MyModel({ firstname: 'hahaha' });
  m.on('change', function () {
    t.equal(m.get('firstname'), '');
    t.done();
  });
  m.set({ firstname: '' }, { validate: true });
};

exports.allowToSetDateFieldToNullWhenNotRequired = function (t) {
  var m = new MyModel({ ctime: new Date() });
  m.on('change', function () {
    t.equal(m.get('ctime'), null);
    t.done();
  });
  m.set({ ctime: null }, { validate: true });
};

exports.doNotAllowToSetDateFieldToAnythingOtherThanADate = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(err, 'Attribute "ctime" must be of type date and got value "not a date".');
    t.equal(m.get('ctime'), undefined);
    t.done();
  });
  m.set({ ctime: 'not a date' }, { validate: true });
};

exports.notAUrl = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(err, 'Attribute "url" must be of type url and got value "not a url".');
    t.equal(m.get('url'), undefined);
    t.done();
  });
  m.set({ url: 'not a url' }, { validate: true });
};

exports.tryToSetAnArrayFieldToSomethingOtherThanAnArray = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/type array/.test(err));
    t.equal(m.get('an_array'), undefined);
    t.done();
  });
  m.set({ an_array: 'not an array' }, { validate: true });
};

exports.dontAllowEmptyArrayIfMinLengthMoreThanZero = function (t) {
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/minimum length/.test(err));
    t.equal(m.get('an_array'), undefined);
    t.done();
  });
  m.set({ a_non_empty_array: [] }, { validate: true });
};
