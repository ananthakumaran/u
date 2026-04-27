import { concat, fromVarN, toVarN, type Coder } from "./core.ts";
import { map } from "lodash-es";

export default function array<T>(entry: Coder<T>): Coder<any[]> {
  return {
    encode: function (array) {
      return concat(
        [{ blob: toVarN(array.length), bits: "" }].concat(
          array.map(entry.encode),
        ),
      );
    },
    decode: function ({ bits, blob }) {
      var size;
      [size, blob] = fromVarN(blob);
      var rest = { bits, blob };
      var array = [],
        result,
        i;
      for (i = 0; i < size; i++) {
        result = entry.decode(rest);
        array[i] = result.value;
        rest = result.rest;
      }
      return { value: array, rest };
    },
  };
}
