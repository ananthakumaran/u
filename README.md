# μ [![Build Status](https://travis-ci.org/ananthakumaran/u.svg?branch=master)](https://travis-ci.org/ananthakumaran/u)

Without μ:
`http://app.com/url#%7B%22lookingFor%22:%22bride%22,%22age%22:%5B25,30%5D,%22religion%22:%22Hindu%22,%22motherTongue%22:%22Bengali%22,%22onlyProfileWithPhoto%22:true%7D`

With μ:
`http://app.com/url#bHhc9I-aqa`

μ is a JavaScript library for encoding/decoding state (JavaScript
object) in URL. Define a spec for the state, based on which the
encoding is done. Manage the state with versioning.

## Example

Import the library

`import {fromJson, encode, decode} from "u";`

Define the spec.

```javascript
var spec = {
        lookingFor: ['oneOf', 'bride', 'groom'],
        age: ['tuple', ['integer'] /* min */, ['integer'] /* max */],
        religion: ['oneOf', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Parsi', 'Jain', 'Buddhist', 'Jewish', 'No Religion', 'Spiritual', 'Other'],
        motherTongue: ['oneOf', 'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani', 'Malayalam', 'Marathi', 'Marwari', 'Odia', 'Punjabi', 'Sindhi', 'Tamil', 'Telugu', 'Urdu'],
        onlyProfileWithPhoto: ['boolean']
};

var v1 = fromJson(1, spec);
```

Encode the object/state.

```javascript
var encodedv1 = encode(v1, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});
//=> 'bHhc9I-aqa'
decode([v1], encodedv1) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});
```

Update your spec, as your application state space grows. Use versioning to
encode/decode state.

```javascript
var newSpec = _.extend({}, spec, {
        maritialStatus: ['oneOf', "Doesn't Matter", 'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Annulled']
});
var v2 = fromJson(2, newSpec, function (old) {
        old.maritialStatus = "Doesn't Matter";
        return old;
});

decode([v1, v2], encodedv1) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: "Doesn't Matter"});
var encodedv2 = encode(v2, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
//=> 'cHlc9I-aHaa'
decode([v1, v2], encodedv2) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
```

## API

### fromJson(version, spec, [migrate])

**version** - spec version number  
**spec** - used to define the structure and domain of the data.

*structure*  
object is defined using { key: specForValue, ... }  
array is defined using ['array', specForValue ]  
tuple is defined using ['tuple', specForValueAtIndexZero, specForValueAtIndexOne, ...]  

*domain*  
domain is defined using [domainName, arg1, arg2, ...]

| Domain | Args | Description |
---------|------|-------------|
| oneOf  | allowed values | can be considered similar to enum. As we only encode the index position, the value could be anything |
| integer |     | any integer |
| boolean |     | true or false |
| fixedchar | Size of the string | fixed length string |
| varchar | | variable length string |

**migrate** - a function that will get called in case where you decode
an object encoded using older spec. For example, there are three
versions v1, v2, v3 and you try to decode the string encoded using v1,
then the migrate method in v2 and v3 will get called with the decoded
value.

### encode(coder, object)

**coder** - coder created using fromJson  
**object** - object that needs to encoded  

### decode(coders, blob)

**coders** - array of coder.  
**blob** - the string that is returned by encode.  
