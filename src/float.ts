import { paddedBinary, type Coder } from "./core.ts";

const CHUNK_SIZE = 3; // digits per chunk
const CHUNK_BITS = 10; // 0–999 fits in 10 bits

export default function float(): Coder<number> {
  return {
    encode: function (num: number) {
      if (!Number.isFinite(num)) {
        throw new Error(`Invalid float: ${num}`);
      }

      const sign = num < 0 ? "0" : "1";
      const abs = Math.abs(num);

      const str = abs.toString();
      const [intRaw, fracRaw = ""] = str.split(".");

      const intPart = intRaw || "0";
      const fracPart = fracRaw;

      const intBinary = parseInt(intPart, 10).toString(2);
      const intBits = paddedBinary(intBinary.length, 6) + intBinary;

      const fracLen = fracPart.length;

      let fracBits = paddedBinary(fracLen, 6);

      const chunkCount = Math.ceil(fracLen / CHUNK_SIZE);
      fracBits += paddedBinary(chunkCount, 6);

      for (let i = 0; i < fracLen; i += CHUNK_SIZE) {
        const chunk = fracPart.substr(i, CHUNK_SIZE);
        const padded = chunk.padEnd(CHUNK_SIZE, "0");

        const value = parseInt(padded, 10);
        fracBits += paddedBinary(value, CHUNK_BITS);
      }

      return {
        bits: sign + intBits + fracBits,
        blob: "",
      };
    },

    decode: function ({ bits, blob }) {
      const sign = bits[0] === "1" ? 1 : -1;
      bits = bits.substr(1);

      const intSize = parseInt(bits.substr(0, 6), 2);
      bits = bits.substr(6);

      const intPart = parseInt(bits.substr(0, intSize), 2);
      bits = bits.substr(intSize);

      const fracLen = parseInt(bits.substr(0, 6), 2);
      bits = bits.substr(6);

      const chunkCount = parseInt(bits.substr(0, 6), 2);
      bits = bits.substr(6);

      let digits = "";

      for (let i = 0; i < chunkCount; i++) {
        const value = parseInt(bits.substr(0, CHUNK_BITS), 2);
        bits = bits.substr(CHUNK_BITS);

        digits += value.toString().padStart(CHUNK_SIZE, "0");
      }

      const fracPart = digits.substr(0, fracLen);

      const str = fracLen > 0 ? `${intPart}.${fracPart}` : `${intPart}`;

      return {
        value: sign * parseFloat(str),
        rest: { bits, blob },
      };
    },
  };
}
