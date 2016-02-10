# μ


A JavaScript library to compactly encode data such that the output can
be used as a part of the URL.


## Example

```javascript
import {fromJson, encode, decode} from "u";
var spec = {
        lookingFor: ['oneOf', 'bride', 'groom'],
        age: ['array', ['integer'] /* min */, ['integer'] /* max */],
        religion: ['oneOf', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Parsi', 'Jain', 'Buddhist', 'Jewish', 'No Religion', 'Spiritual', 'Other'],
        motherTongue: ['oneOf', 'Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani', 'Malayalam', 'Marathi', 'Marwari', 'Odia', 'Punjabi', 'Sindhi', 'Tamil', 'Telugu', 'Urdu'],
        onlyProfileWithPhoto: ['boolean']
};

var v1 = fromJson(1, spec);
var encodedv1 = encode(v1, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});
//=> 'abaNc9I-aqa'
decode([v1], encodedv1) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true});

var newSpec = _.extend({}, spec, {
        maritialStatus: ['oneOf', "Doesn't Matter", 'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Annulled']
});
var v2 = fromJson(2, newSpec, function (old) {
        old.maritialStatus = "Doesn't Matter";
        return old;
});

decode([v1, v2], encodedv1) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: "Doesn't Matter"});
var encodedv2 = encode(v2, {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
//=> 'acaRc9I-aHaa'
decode([v1, v2], encodedv2) //=> {lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married'});
```

## API

### fromJson(version, spec, [migrate])

**version** - spec version number  
**spec** - used to define the structure and domain of the data.

*structure*  
object is defined using { key: specForValue }  
array is defined using
['array', specForValueAtIndexZero, specForValueAtIndexOne, ...]  

*domain*  
domain is defined using [domainName, arg1, arg2, ...]

**oneOf** - can be considered similar to enum. The list of allowed
values are specified as args. As we only encode the index position,
the value could be any javascript value.  
**integer** - any integer  
**boolean** - true and false  
**fixedchar** - fixed length string. Size of the string is specified
as the first arg.  
**varchar** - variable length string. Maximum size of the string is
specified as the first arg.  

**migrate** - a function that will get called in case where you decode
an object encoded using older spec. For example, there are three
versions v1, v2, v3 and you try to decode the string encoded using v1,
then the migrate method in v2 and v3 will get called with the decoded
value.

### encode(coder, object)

**coder** - coder created using fromJson  
**object** - object that needs to encoded  

### decode(coders, blob)

**coders** - array of coders.  
**blob** - the string that is returned by encode.  
