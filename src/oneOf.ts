import { paddedBinary, bitsRequired, type Coder } from "./core.ts";

export default function oneOf<T>(...choices: T[]): Coder<T> {
  const bitSize = bitsRequired(choices.length - 1);
  return {
    encode: function (choice) {
      const index = choices.indexOf(choice);
      if (index === -1) {
        throw new Error(
          `Invalid choice: ${choice} is not one of ${choices.join(",")}`,
        );
      }
      return { bits: paddedBinary(index, bitSize), blob: "" };
    },

    decode: function ({ bits, blob }) {
      const index = parseInt(bits.substr(0, bitSize), 2);
      if (index >= choices.length || index < 0) {
        throw new Error(
          `Invalid choice: ${index} should be less than ${choices.length}`,
        );
      }
      return {
        value: choices[index]!,
        rest: { bits: bits.substring(bitSize), blob },
      };
    },
  };
}
