import type { Coder } from "./core.ts";

export default function fixedchar(size: number): Coder<string> {
  return {
    encode: function (string) {
      return { bits: "", blob: string.toString() };
    },
    decode: function ({ bits, blob }) {
      return {
        value: blob.substr(0, size),
        rest: { bits, blob: blob.substr(size) },
      };
    },
  };
}
