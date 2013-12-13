# backbone-validator [![Build Status](https://secure.travis-ci.org/lupomontero/backbone-validator.png)](http://travis-ci.org/lupomontero/backbone-validator)

> A super simple validator module for [Backbone](http://backbonejs.org). It
works both on the browser and nodejs.

## Installing

In node:

    npm install backbone-validator --save

In the browser make sure that you add the
[backbone-validator-min.js](https://raw.github.com/lupomontero/backbone-validator/master/backbone-validator-min.js)
script after you have loaded both [Underscore](http://underscorejs.org) and
[Backbone](http://backbonejs.org). The minimised file is 2k.

## Usage

```javascript
var Backbone = require('Backbone');
var validator = require('validator');

var MyModel = Backbone.Model.extend({
  validate: validator.create({
    type: { equal: 'user', msg: "type must be `user`" },
    firstname: { type: 'string', minLength: 3, maxlength: 20 },
    email: { type: 'email' }
  })
});

var model = new MyModel();
model.on('invalid', function (m, err) {
  // Validation failed
  // `err` will be an object with the error message {type:'message'}.
});
model.set({ type: 'not user' }, { validate: true });
```

## API

### validator.create( schema )

To use this module you basically invoke `validator.create()` passing it a
`schema` object. This will return a function, and we set the model's `validate`
property to this function, so that `Backbone` can use when setting attribute
values (ie: when `model.save()` is invoked).

### Defining a schema

A `schema` object contains a property for each `attribute` we want to validate,
the property name is the `attribute` name and the value is an object containing
a set of rules.

In the example below we want to validate the `ctime`, `status` and `message`
attribues in our model, so our schema will look something like this:

```javascript
validator.create({
  ctime: { type: 'date' },
  status: { oneOf: [ 1, 2, 3 ] },
  message: { type: string, minLength: 5 }
});
```

### Rules

Eache rule is declared passing it `options`. This `options` depend on each of
the rules (ie: for the `required` rule `options` is just a boolean, for the
`oneOf` its an array, for `custom` its a function and so on.

  * `required`

```javascript
validator.create({
  message: { required: true }
});
```

  * `equal`

```javascript
validator.create({
  type: { equal: 'user' }
});
```

  * `regexp`

```javascript
validator.create({
  birthday: { regexp: /^\d{2}\/\d{2}\/\d{4}$/ }
});
```

  * `oneOf`

```javascript
validator.create({
  colour: { oneOf: [ 'red', 'green', 'blue' ] }
});
```

  * `type`. Types: `boolean`, `number`, `string`, `date`, `array`, `email`,
    `model`, `collection`, `url` and `domain`.

```javascript
validator.create({
  balance: { type: 'number' }
});
```

  * `minLength`. Can be used with strings or arrays.

```javascript
validator.create({
  firstname: { type: 'string', minLength: 3 }
});
```

  * `maxLength`. Can be used with strings or arrays.

```javascript
validator.create({
  firstname: { type: 'string', maxLength: 20, minLength: 2 }
});
```
  
  * `recurse`. Can be used to do submodel validation.

```javascript
validator.create({
  submodel: { type: 'model', recurse: true }
});
```

### Custom validation rules

```javascript
var MyModel = Backbone.Model.extend({
  validate: validator.create({
    phone: {
      custom: function (value) {
        // This function will be called with the value that needs to be
        // validated. If you want validation to fail simply return a string with
        // the error message. If nothing is returned validation for this
        // attribute is consider to have passed.
      }
    }
  })
});
```

### Custom error messages

backbone-validator comes with default error messages that can be overriden.

```javascript
validator.create({
  field: { regexp: /aregex/, msg: "A custom message." }
});
```

---

## TODO

* Add browser tests.
