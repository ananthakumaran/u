# μ

Without μ:
`http://app.com/url#%7B%22lookingFor%22:%22bride%22,%22age%22:%5B25,30%5D,%22religion%22:%22Hindu%22,%22motherTongue%22:%22Bengali%22,%22onlyProfileWithPhoto%22:true%7D`

With μ:
`http://app.com/url#bHhc9I-aqa`

μ is a JavaScript library for encoding/decoding state (JavaScript
object) in URL. Define a spec for the state, based on which the
encoding is done. Manage the state with versioning.

## Example

Import the library

```javascript
import { fromJson, encode, decode } from "u-node";
```

Define the spec.

```javascript
const spec = {
  lookingFor: ["oneOf", "bride", "groom"],
  age: ["tuple", ["integer"] /* min */, ["integer"] /* max */],
  religion: ["oneOf", "Hindu", "Muslim", "Christian", "Sikh", "Parsi", "Jain", "Buddhist", "Jewish", "No Religion", "Spiritual", "Other" ],
  motherTongue: ["oneOf", "Assamese", "Bengali", "English", "Gujarati", "Hindi", "Kannada", "Konkani", "Malayalam", "Marathi", "Marwari", "Odia", "Punjabi", "Sindhi", "Tamil", "Telugu", "Urdu"],
  onlyProfileWithPhoto: ["boolean"],
};

const v1 = fromJson(1, spec);
```

Encode the object/state.

```javascript
const encodedv1 = encode(v1, {
  lookingFor: "bride",
  age: [25, 30],
  religion: "Hindu",
  motherTongue: "Bengali",
  onlyProfileWithPhoto: true,
});
// => 'bHhc9I-aqa'

decode([v1], encodedv1);
// => { lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true }
```

Update your spec as your application state space grows. Use versioning
to encode/decode state.

```javascript
const newSpec = {
  ...spec,
  maritialStatus: ["oneOf", "Doesn't Matter", "Never Married", "Divorced", "Widowed", "Awaiting Divorce", "Annulled"],
};

const v2 = fromJson(2, newSpec, (old) => {
  old.maritialStatus = "Doesn't Matter";
  return old;
});

decode([v1, v2], encodedv1);
// => { lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: "Doesn't Matter" }

const encodedv2 = encode(v2, {
  lookingFor: "bride",
  age: [25, 30],
  religion: "Hindu",
  motherTongue: "Bengali",
  onlyProfileWithPhoto: true,
  maritialStatus: "Never Married",
});
// => 'cHlc9I-aHaa'

decode([v1, v2], encodedv2);
// => { lookingFor: 'bride', age: [25, 30], religion: 'Hindu', motherTongue: 'Bengali', onlyProfileWithPhoto: true, maritialStatus: 'Never Married' }
```

Recursive structure

```javascript
const node = {
  name: ["varchar"],
  children: ["array", ["ref", "node"]],
};

const v1 = fromJson(1, node, (a) => a, { node });
```

## API

### fromJson(version, spec, [migrate], [definitions])

- **version** - spec version number
- **spec** - used to define the structure and domain of the data.

  - **structure**
    * object is defined using `{ key: specForValue, ... }`
    * array is defined using `["array", specForValue]`
    * tuple is defined using `["tuple", specForValueAtIndexZero, specForValueAtIndexOne, ...]`

  - **domain**
    domain is defined using `[domainName, arg1, arg2, ...]`

    | Domain    | Args               | Description                             |
    | --------- | ------------------ | --------------------------------------- |
    | oneOf     | allowed values     | similar to enum; encodes index position |
    | integer   |                    | any integer                             |
    | float     |                    | any float                               |
    | boolean   |                    | true or false                           |
    | fixedchar | size of the string | fixed length string                     |
    | varchar   |                    | variable length string                  |

- **migrate** (optional) - called when decoding older versions. Each
subsequent version’s migrate runs in sequence.

- **definitions** (optional) - object mapping names to specs for
recursive structures. Reference via `["ref", name]`.

### encode(coder, object)

* **coder** - coder created using `fromJson`
* **object** - object to encode

### decode(coders, blob)

* **coders** - array of coders
* **blob** - encoded string returned by `encode`
