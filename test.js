/*globals require, exports */

var Backbone = require('backbone');
var validator = require('./index');
var SmallModel = Backbone.Model.extend({
  validate: validator.create({
    someRequiredField: {required: true}
  })
});
var MyModel = Backbone.Model.extend({
  validate: validator.create({
    type: { equal: 'user' },
    ctime: { type: 'date' },
    someRequiredField: { required: true },
    firstname: { type: 'string' },
    middlename: { type: 'string', msg: 'Middle name is required', required: true },
    lastname: { type: 'string', minLength: 2, maxLength: 24 },
    organisation: { type: 'string', maxLength: 24 },
    email: { type: 'email', required: true },
    url: { type: 'url' },
    an_array: { type: 'array' },
    a_non_empty_array: { type: 'array', minLength: 1 },
    domain: { type: 'domain' }
  })
});

exports.validateAllGood = function (t) {
  t.expect(4);
  var m = new MyModel({
    type: 'user',
    firstname: 'Lupo',
    lastname: 'Montero',
    email: 'lupo@e-noise.com'
  }, { validate: true });

  t.equal(m.get('type'), 'user');
  t.equal(m.get('firstname'), 'Lupo');
  t.equal(m.get('lastname'), 'Montero');
  t.equal(m.get('email'), 'lupo@e-noise.com');
  t.done();
};
exports.validateMultipleBad = function (t) {
  var m = new MyModel();
  t.expect(3);

  m.on('invalid', function (m, err) {
    t.equal(err.length, 2);
    t.equal(err[0].attr, 'lastname');
    t.equal(err[0].msg, 'Attribute "lastname" was expected to have a minimum length of 2 and the current value ("")has a length of 0.');
    t.done();
  });
  m.set({
    type: 'user',
    firstname: 'Lupo',
    lastname: '',
    email: 'lupoe-noise.com'
  }, { validate: true });
};

exports.validateBadEmail = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(m.get('email'), undefined);
    t.equal(err[0].msg, 'Attribute "email" must be of type email and got value "not an email".');
    t.done();
  });
  m.set({ email: 'not an email' }, { validate: true });
};

exports.validateStringMaxLengthFailure = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err[0].msg));
    t.equal(m.get('organisation'), undefined);
    t.done();
  });
  m.set({
    organisation: 'Some very long string that won\'nt fit here!'
  }, { validate: true });
};

exports.stringMinLengthFailureWithBothMinAndMaxLength = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/minimum length/.test(err[0].msg));
    t.equal(m.get('lastname'), undefined);
    t.done();
  });
  m.set({ lastname: 'S' }, { validate: true });
};

exports.stringMaxLengthFailureWithBothMinAndMaxLength = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err[0].msg));
    t.equal(m.get('lastname'), undefined);
    t.done();
  });
  m.set({ lastname: 'A super long lastname or what' }, { validate: true });
};

exports.validateStringMinAndMaxLengthTogetherSuccess = function (t) {
  t.expect(1);
  var m = new MyModel();
  m.on('change', function () {
    t.equal(m.get('lastname'), 'A good lastname');
    t.done();
  });
  m.set({ lastname: 'A good lastname' }, { validate: true });
};

exports.tryToSetRequiredFieldToEmptyString = function (t) {
  t.expect(2);
  var m = new MyModel({ someRequiredField: 'foo' });
  m.on('invalid', function (m, err) {
    t.equal(err[0].msg, 'Attribute "someRequiredField" is required.');
    t.equal(m.get('someRequiredField'), 'foo');
    t.done();
  });
  m.set({ someRequiredField: '' }, { validate: true });
};

exports.allowToSetEmptyStringWhenNotRequired = function (t) {
  t.expect(1);
  var m = new MyModel({ firstname: 'hahaha' });
  m.on('change', function () {
    t.equal(m.get('firstname'), '');
    t.done();
  });
  m.set({ firstname: '' }, { validate: true });
};

exports.allowToSetDateFieldToNullWhenNotRequired = function (t) {
  t.expect(1);
  var m = new MyModel({ ctime: new Date() });
  m.on('change', function () {
    t.equal(m.get('ctime'), null);
    t.done();
  });
  m.set({ ctime: null }, { validate: true });
};

exports.doNotAllowToSetDateFieldToAnythingOtherThanADate = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(err[0].msg, 'Attribute "ctime" must be of type date and got value "not a date".');
    t.equal(m.get('ctime'), undefined);
    t.done();
  });
  m.set({ ctime: 'not a date' }, { validate: true });
};

exports.notAUrl = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(err[0].msg, 'Attribute "url" must be of type url and got value "not a url".');
    t.equal(m.get('url'), undefined);
    t.done();
  });
  m.set({ url: 'not a url' }, { validate: true });
};

exports.tryToSetAnArrayFieldToSomethingOtherThanAnArray = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/type array/.test(err[0].msg));
    t.equal(m.get('an_array'), undefined);
    t.done();
  });
  m.set({ an_array: 'not an array' }, { validate: true });
};

exports.dontAllowEmptyArrayIfMinLengthMoreThanZero = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/minimum length/.test(err[0].msg));
    t.equal(m.get('an_array'), undefined);
    t.done();
  });
  m.set({ a_non_empty_array: [] }, { validate: true });
};

exports.badDomain = function (t) {
  t.expect(5);
  var m = new MyModel();
  var domains = [ 'not a domain', 'd.d', 'doo.', '$tyu.di', '-djdjn.com' ];
  var count = 0;
  m.on('invalid', function (m, err) {
    t.ok(/must be of type domain/.test(err[0].msg));
    if (++count === domains.length) {
      t.done();
    }
  });
  domains.forEach(function (domain) {
    m.set('domain', domain, { validate: true });
  });
};

exports.goodDomain = function (t) {
  t.expect(5);
  var m = new MyModel();
  var domains = [ 'pepe.com', 'enoi.se', 'foo.ac.uk', 'aaaaa.com.jp', 'ba.com' ];
  var count = 0;
  m.on('change', function () {
    t.equal(m.get('domain'), domains[count]);
    if (++count === domains.length) {
      t.done();
    }
  });
  domains.forEach(function (domain) {
    m.set('domain', domain, { validate: true });
  });
};

exports.overrideBuiltInErrorMessage = function (t) {
  t.expect(2);
  var m = new MyModel({ middlename: 'foo' });
  m.on('invalid', function (m, err) {
    t.equal(err[0].msg, 'Middle name is required');
    t.equal(m.get('middlename'), 'foo');
    t.done();
  });
  m.set({ middlename: '' }, { validate: true });
};
exports.subobjectValidation = function (t) {
  t.expect(2);
  var s = new SmallModel(),
  m = new MyModel({bar: s});
  s.on('invalid', function (m, err) {
    t.equal(1,err.length);
    t.done();
  });
  m.on('invalid', function (m, err) {
    t.equal(1, err.length);
    s.set('someRequiredField', '', {validate: true});
  });
  m.get('bar').set('someRequiredField', '');
  m.isValid();
};
