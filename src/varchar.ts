import { fromVarN, toVarN, type Coder } from "./core.ts";

export default function varchar(): Coder<string> {
  return {
    encode: function (string: string) {
      return { bits: "", blob: toVarN(string.length) + string };
    },
    decode: function ({ bits, blob }) {
      let size;
      [size, blob] = fromVarN(blob);
      return {
        value: blob.substr(0, size),
        rest: { bits, blob: blob.substr(size) },
      };
    },
  };
}
