import { concat, isNone, none, notNone, type Coder } from "./core.ts";
import { each, flatten, has, map } from "lodash-es";

export default function object<T>(
  entries: Record<string, Coder<T>>,
): Coder<Record<string, any>> {
  return {
    encode: function (object) {
      return concat(
        flatten(
          map(entries, function (entry, key) {
            if (has(object, key)) {
              return [{ bits: notNone, blob: "" }, entry.encode(object[key])];
            }
            return { bits: none, blob: "" };
          }),
        ),
      );
    },
    decode: function ({ bits, blob }) {
      var object: Record<string, any> = {};
      each(entries, function (entry, key) {
        if (isNone(bits)) {
          bits = bits.substr(1);
          return;
        } else {
          bits = bits.substr(1);
        }

        var result = entry.decode({ bits, blob });
        bits = result.rest.bits;
        blob = result.rest.blob;
        object[key] = result.value;
      });
      return { value: object, rest: { bits, blob } };
    },
  };
}
