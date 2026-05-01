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
import tuple from "./tuple.ts";
import ref, { createRef, type Ref } from "./ref.ts";
import float from "./float.ts";

export const availableTypes = {
  array,
  boolean,
  fixedchar,
  integer,
  float,
  object,
  oneOf,
  varchar,
  tuple,
  ref,
};

export function encode(coder: JsonSpec, object: Record<string, any>) {
  const { bits, blob } = coder.spec.encode(object);
  return coder.encodedVersion + toVarN(bits.length) + bitsToN(bits) + blob;
}

export function decode(coders: JsonSpec[], string: string) {
  let version: number, bitSize: number;
  [version, string] = fromVarN(string);
  [bitSize, string] = fromVarN(string);

  const coder = coders.find((c) => c.version === version);
  if (!coder) {
    throw new Error(`Invalid version: ${version}`);
  }

  const bitCharSize = Math.ceil(bitSize / 6);
  const bits = nToBits(string.substr(0, bitCharSize), bitSize);
  const blob = string.substr(bitCharSize);
  const result = coder.spec.decode({ bits, blob });
  const pendingMigrations = coders
    .filter((coder) => coder.version > version)
    .sort((a, b) => a.version - b.version);

  return pendingMigrations.reduce(
    (value, coder) => coder.migrate(value),
    result.value,
  );
}

export function fromJson(
  version: number,
  jsonSpec: ObjectSpec,
  migrate: (old: any) => any,
  definitions: Record<string, Spec>,
) {
  const references: Record<string, Ref<Coder<any>>> = {};
  definitions = definitions || {};
  for (const [key] of Object.entries(definitions)) {
    references[key] = createRef();
  }

  for (const [key, value] of Object.entries(definitions)) {
    references[key]!.set(loop(value));
  }

  function loop(spec: Spec): Coder<any> {
    if (Array.isArray(spec)) {
      const method = spec[0];
      if (method === "tuple") {
        return availableTypes.tuple((spec.slice(1) as Spec[]).map(loop));
      } else if (method === "array") {
        return availableTypes.array(loop(spec[1]));
      } else if (method === "ref") {
        const reference = references[spec[1]];
        if (!reference) {
          throw new Error(`Invalid reference name: ${spec}`);
        }
        return availableTypes.ref(reference);
      } else {
        return availableTypes[method].apply(null, spec.slice(1));
      }
    } else if (typeof spec === "object") {
      const entries = Object.keys(spec).sort();
      return availableTypes.object(
        Object.fromEntries(entries.map((key) => [key, loop(spec[key]!)])),
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
