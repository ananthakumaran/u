import { concat, fromVarN, toVarN, type Coder } from "./core.ts";

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
      let size;
      [size, blob] = fromVarN(blob);
      let rest = { bits, blob };
      const array = [];
      let result, i;
      for (i = 0; i < size; i++) {
        result = entry.decode(rest);
        array[i] = result.value;
        rest = result.rest;
      }
      return { value: array, rest };
    },
  };
}
