import { concat, type Coder } from "./core.ts";
import { each } from "lodash-es";

export function tuple(entries: any[]): Coder<any[]> {
  return {
    encode: function (array) {
      return concat(entries.map((entry, i) => entry.encode(array[i])));
    },
    decode: function (rest) {
      const array: any[] = [];
      each(entries, (entry, i) => {
        const result = entry.decode(rest);
        array[i] = result.value;
        rest = result.rest;
      });
      return { value: array, rest };
    },
  };
}
