/*globals require, exports */

var _ = require('underscore'),
Backbone = require('backbone'),
validator = require('./index');

var SubModel = Backbone.Model.extend({
  validate: validator.create({
    someRequiredField: {required: true}
  })
}),
SubCollection = Backbone.Collection.extend({
  model: SubModel
}),
MyModel = Backbone.Model.extend({
  defaults: {
    type: 'user',
    someRequiredField: true,
    middlename: 'middlename',
    lastname: 'lastname',
    organisation: 'org',
    email: 'test@example.com',
    a_non_empty_array: ['a'],
    submodel: new SubModel({someRequiredField: true}),
    subcollection: new SubCollection()
  },
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
    domain: { type: 'domain' },
    submodel: { type: 'model', recurse: true },
    subcollection: { type: 'collection', recurse: true }
  })
});

exports.validateEmptyAllGood = function (t) {
  t.expect(1);
  var m = new MyModel({}, {validate: true});
  t.ok(m.isValid());
  t.done();
};
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
  t.expect(2);

  m.on('invalid', function (m, err) {
    t.ok(err.email);
    t.equal(err.lastname, '"lastname" was expected to have a minimum length of 2.');
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
    t.equal(m.get('email'), 'test@example.com');
    t.equal(err.email, '"email" must be of type email and got value "not an email".');
    t.done();
  });
  m.set({ email: 'not an email' }, { validate: true });
};

exports.validateStringMaxLengthFailure = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err.organisation));
    t.equal(m.get('organisation'), 'org');
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
    t.ok(/minimum length/.test(err.lastname));
    t.equal(m.get('lastname'), 'lastname');
    t.done();
  });
  m.set({ lastname: 'S' }, { validate: true });
};

exports.stringMaxLengthFailureWithBothMinAndMaxLength = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/maximum length/.test(err.lastname));
    t.equal(m.get('lastname'), 'lastname');
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
exports.missingRequiredField = function (t) {
  t.expect(1);
  var m = new MyModel({ someRequiredField: null });
  t.ok(!m.isValid());
  t.done();
};

exports.tryToSetRequiredFieldToEmptyString = function (t) {
  t.expect(2);
  var m = new MyModel({ someRequiredField: 'foo' });
  m.on('invalid', function (m, err) {
    t.equal(err.someRequiredField, '"someRequiredField" is required.');
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
    t.equal(err.ctime, '"ctime" must be of type date and got value "not a date".');
    t.equal(m.get('ctime'), undefined);
    t.done();
  });
  m.set({ ctime: 'not a date' }, { validate: true });
};

exports.notAUrl = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.equal(err.url, '"url" must be of type url and got value "not a url".');
    t.equal(m.get('url'), undefined);
    t.done();
  });
  m.set({ url: 'not a url' }, { validate: true });
};

exports.tryToSetAnArrayFieldToSomethingOtherThanAnArray = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/type array/.test(err.an_array));
    t.equal(m.get('an_array'), undefined);
    t.done();
  });
  m.set({ an_array: 'not an array' }, { validate: true });
};

exports.dontAllowEmptyArrayIfMinLengthMoreThanZero = function (t) {
  t.expect(2);
  var m = new MyModel();
  m.on('invalid', function (m, err) {
    t.ok(/minimum length/.test(err.a_non_empty_array));
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
    t.ok(/must be of type domain/.test(err.domain));
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
  t.expect(3);
  var m = new MyModel({ middlename: 'foo' });
  m.on('invalid', function (m, err) {
    t.ok(err.middlename);
    t.equal(err.middlename, 'Middle name is required');
    t.equal(m.get('middlename'), 'foo');
    t.done();
  });
  m.set({ middlename: '' }, { validate: true });
};
exports.isModelSuccess = function (t) {
  t.expect(1);
  m = new MyModel({foo: new SubModel({})});
  m.validate = validator.create({
    foo: {type: 'model'}
  });
  t.ok(m.isValid());
  t.done();
};
exports.isCollectionSuccess = function (t) {
  t.expect(1);
  m = new MyModel({foo: new Backbone.Collection({})});
  m.validate = validator.create({
    foo: {type: 'collection'}
  });
  t.ok(m.isValid());
  t.done();
};
exports.recurseFailure = function (t) {
  t.expect(6);
  var s = new SubModel(),
  m = new MyModel({
    submodel: s,
    subcollection: new SubCollection([{id: 'foo', someRequiredField: null}, {someRequiredField: null}])
  });
  m.on('invalid', function (m, err) {
    t.ok(err.submodel);
    t.ok(err.submodel.someRequiredField);
    t.ok(err.subcollection);
    t.ok(err.subcollection.foo);
    t.ok(err.subcollection.foo.someRequiredField);
    t.equal(_(err.subcollection).size(), 2);
    t.done();
  });
  m.get('submodel').set('someRequiredField', '');
  t.ok(!m.isValid());
};
exports.recurseSuccess = function (t) {
  t.expect(1);
  var m = new MyModel({
    submodel: new SubModel(),
    subcollection: new SubCollection([{someRequiredField: 'foo'}, {someRequiredField: 'bar'}])
  });
  m.get('submodel').set('someRequiredField', 's');
  t.ok(m.isValid());
  t.done();
};
exports.ruleExtension = function (t) {
  v = require('./index');
  v.rules.testrule = function () {
    return 'baz';
  };
  m = new MyModel({foo: 'bar'});
  m.on('invalid', function (m, err) {
    t.ok(err.foo);
    t.done();
  });
  m.validate = v.create({
    foo: {testrule: true}
  });
  m.isValid();
};
exports.typeExtension = function (t) {
  v = require('./index');
  v.type.testtype = function () {
    return false;
  };
  m = new MyModel({foo: 'bar'});
  m.on('invalid', function (m, err) {
    t.ok(/must be of type testtype/.test(err.foo));
    t.done();
  });
  m.validate = v.create({
    foo: {type: 'testtype'}
  });
  m.isValid();
};
