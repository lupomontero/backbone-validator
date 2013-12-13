(function(){function a(a){return!e.isUndefined(a)&&!e.isNull(a)&&""!==a}function b(a,b,d){var f,g;for(f in d)if(d.hasOwnProperty(f)&&e.isFunction(c.rules[f])&&(g=c.rules[f](a,b,d[f])))return d.msg||g}var c,d=this;c="undefined"!=typeof exports?exports:d.validator={},c.VERSION="0.1.0";var e=d._,f=d.Backbone;e||"undefined"==typeof require||(e=require("underscore")),f||"undefined"==typeof require||(f=require("backbone")),c.REGEXP_EMAIL=/^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,c.REGEXP_URL=/^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/,c.REGEXP_DOMAIN=/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,4}(\.[a-z]{2-4})?/i,c.type={"boolean":e.isBoolean,number:e.isNumber,string:e.isString,date:e.isDate,array:e.isArray,email:e.bind(c.REGEXP_EMAIL.test,c.REGEXP_EMAIL),url:e.bind(c.REGEXP_URL.test,c.REGEXP_URL),domain:e.bind(c.REGEXP_DOMAIN.test,c.REGEXP_DOMAIN)},c.type.model=function(a){return a instanceof f.Model},c.type.collection=function(a){return a instanceof f.Collection},c.rules={required:function(b,c){return a(c)?void 0:'"'+b+'" is required.'},equal:function(a,b,c){return b!==c?'"'+a+'" must be equal to "'+c+'" and got "'+b+'".':void 0},regexp:function(a,b,c){return e.isRegExp(c)&&!c.test(b)?'"'+a+'" didn\'t match regexp. (got: "'+b+'")':void 0},oneOf:function(a,b,c){return-1===e.indexOf(c,b)?'"'+a+'" must be one of "'+c.join(", ")+'" and got "'+b+'" instead.':void 0},type:function(b,d,e){var f='"'+b+'" must be of type '+e+' and got value "'+d+'".';if(a(d)){var g=c.type[e];return g&&g(d)?void 0:f}},minLength:function(a,b,c){return e.isString(b)||e.isArray(b)?b.length<c?'"'+a+'" was expected to have a minimum length of '+c+".":void 0:a+" is not a String or Array"},maxLength:function(a,b,c){return e.isString(b)||e.isArray(b)?b.length>c?'"'+a+'" was expected to have a maximum length of '+c:void 0:a+" is not a String or Array"},recurse:function(a,b,d){var f;if(d){if(b&&e.isFunction(b.validate)&&(f=b.validate(b.attributes))&&e(f).size())return f;if(b&&c.type.collection(b)){if(f={},b.each(function(a){var b=a.validate(a.attributes);b&&(f[a.id||a.cid]=b)}),e(f).size())return f}else if(!b||!e.isFunction(b.validate))return'"'+a+'": has no validate method'}},custom:function(a,b,c){if(e.isFunction(c)){var d=c(b);if(d)return d}}},c.create=function(a){return a=a||{},function(c){var d,f,g={};for(d in a)(f=b(d,c[d],a[d]))&&(g[d]=f);return e(g).size()?g:void 0}}}).call(this);