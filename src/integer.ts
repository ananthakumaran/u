import { paddedBinary, type Coder } from "./core.ts";

export default function integer(): Coder<number> {
  return {
    encode: function (int) {
      const binary = Math.abs(int).toString(2);
      const bits =
        paddedBinary(binary.length, 6) + (int > 0 ? "1" : "0") + binary;
      return { bits, blob: "" };
    },
    decode: function ({ bits, blob }) {
      const size = parseInt(bits.substr(0, 6), 2);
      bits = bits.substr(6);
      const sign = bits[0] === "1" ? 1 : -1;
      bits = bits.substr(1);
      return {
        value: sign * parseInt(bits.substr(0, size), 2),
        rest: { bits: bits.substr(size), blob },
      };
    },
  };
}
