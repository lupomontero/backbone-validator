# backbone-validator

[![Build Status](https://secure.travis-ci.org/lupomontero/backbone-validator.png)](http://travis-ci.org/lupomontero/backbone-validator)

This is a super simple validator module for Backbone. It works both on the
browser and nodejs.

## Usage

```javascript
var Backbone = require('Backbone');
var validator = require('validator');

var MyModel = Backbone.Model.extend({
  validate: validator.create({
    type: { equal: 'user' },
    firstname: { type: 'string', minLength: 3, maxlength: 20 },
    email: { type: 'email' }
  })
});

var model = new MyModel();
model.on('invalid', function (m, err) {
  // Validation failed
  // `err` will be a string with the error message.
});
model.set({ type: 'not user' }, { validate: true });
```

## API

### validator.create( schema )

### Rules

  * `required`
  * `equal`
  * `regexp`
  * `oneOf`
  * `type`
  * `minLength`
  * `maxLength`
  * `custom`

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
