import { concat, isNone, none, notNone, type Coder } from "./core.ts";
export default function object<T>(
  entries: Record<string, Coder<T>>,
): Coder<Record<string, any>> {
  return {
    encode: function (object) {
      return concat(
        Object.entries(entries)
          .map(function ([key, entry]) {
            if (Object.hasOwn(object, key)) {
              return [{ bits: notNone, blob: "" }, entry.encode(object[key])];
            }
            return { bits: none, blob: "" };
          })
          .flat(),
      );
    },
    decode: function ({ bits, blob }) {
      const object: Record<string, any> = {};
      for (const [key, entry] of Object.entries(entries)) {
        if (isNone(bits)) {
          bits = bits.substr(1);
          continue;
        } else {
          bits = bits.substr(1);
        }

        const result = entry.decode({ bits, blob });
        bits = result.rest.bits;
        blob = result.rest.blob;
        object[key] = result.value;
      }
      return { value: object, rest: { bits, blob } };
    },
  };
}
