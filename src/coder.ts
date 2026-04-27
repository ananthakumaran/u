import {
  filter,
  find,
  fromPairs,
  isArray,
  isObject,
  keys,
  map,
  reduce,
  sortBy,
  tail,
} from "lodash-es";
import {
  bitsToN,
  nToBits,
  fromVarN,
  toVarN,
  type Coder,
  type ObjectSpec,
  type Spec,
} from "./core.ts";
import array from "./array.ts";
import boolean from "./boolean.ts";
import fixedchar from "./fixedchar.ts";
import integer from "./integer.ts";
import object from "./object.ts";
import oneOf from "./oneOf.ts";
import varchar from "./varchar.ts";
import { tuple } from "./tuple.ts";

export const availableTypes = {
  array,
  boolean,
  fixedchar,
  integer,
  object,
  oneOf,
  varchar,
  tuple,
};

export function encode(coder: JsonSpec, object: Record<string, any>) {
  var { bits, blob } = coder.spec.encode(object);
  return coder.encodedVersion + toVarN(bits.length) + bitsToN(bits) + blob;
}

export function decode(coders: JsonSpec[], string: string) {
  let version: number, bitSize: number;
  [version, string] = fromVarN(string);
  [bitSize, string] = fromVarN(string);

  var coder = find(coders, (c) => c.version === version);
  if (!coder) {
    throw new Error(`Invalid version: ${version}`);
  }

  var bitCharSize = Math.ceil(bitSize / 6);
  var bits = nToBits(string.substr(0, bitCharSize), bitSize);
  var blob = string.substr(bitCharSize);
  var result = coder.spec.decode({ bits, blob });
  var pendingMigrations = sortBy(
    filter(coders, (coder) => coder.version > version),
    "version",
  );
  return reduce(
    pendingMigrations,
    (value, coder) => coder.migrate(value),
    result.value,
  );
}

export function fromJson(
  version: number,
  jsonSpec: ObjectSpec,
  migrate: (old: any) => any,
) {
  function loop(spec: Spec): Coder<any> {
    if (isArray(spec)) {
      var method = spec[0];
      if (method === "tuple") {
        return availableTypes.tuple(map(tail(spec), loop));
      } else if (method === "array") {
        return availableTypes.array(loop(spec[1]));
      } else {
        return availableTypes[method].apply(null, tail(spec));
      }
    } else if (isObject(spec)) {
      var entries = keys(spec).sort();
      return availableTypes.object(
        fromPairs(
          map(entries, function (key) {
            return [key, loop(spec[key]!)];
          }),
        ),
      );
    }
    throw new Error(`Invalid spec: ${spec}`);
  }

  return {
    version: version,
    spec: loop(jsonSpec),
    jsonSpec: jsonSpec,
    encodedVersion: toVarN(version),
    migrate: migrate || ((x) => x),
  };
}

type JsonSpec = ReturnType<typeof fromJson>;
