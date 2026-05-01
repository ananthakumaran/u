import { concat, type Coder } from "./core.ts";

export default function tuple(entries: any[]): Coder<any[]> {
  return {
    encode: function (array) {
      return concat(entries.map((entry, i) => entry.encode(array[i])));
    },
    decode: function (rest) {
      const array: any[] = [];
      entries.forEach((entry, i) => {
        const result = entry.decode(rest);
        array[i] = result.value;
        rest = result.rest;
      });
      return { value: array, rest };
    },
  };
}
