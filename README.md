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
