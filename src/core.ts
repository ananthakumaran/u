type CoderContext = {
  bits: string;
  blob: string;
};

export interface Coder<T> {
  decode(context: CoderContext): { value: T; rest: CoderContext };
  encode(value: T): CoderContext;
}

type ArraySpec = ["array", Spec];
type BooleanSpec = ["boolean"];
type OneOfSpec = ["oneOf", any, ...any[]];
type FixedCharSpec = ["fixedchar", number];
type IntegerSpec = ["integer"];
type FloatSpec = ["float"];
type VarCharSpec = ["varchar"];
type TupleSpec = ["tuple", Spec, ...Spec[]];
type RefSpec = ["ref", string];
export type Spec =
  | ArraySpec
  | BooleanSpec
  | FixedCharSpec
  | IntegerSpec
  | FloatSpec
  | { [key: string]: Spec }
  | OneOfSpec
  | VarCharSpec
  | TupleSpec
  | RefSpec;
export type ObjectSpec = { [key: string]: Spec };

export function bitsRequired(maxValue: number) {
  if (maxValue === 0) {
    return 1;
  }
  return Math.floor(Math.log(maxValue) / Math.LN2) + 1;
}

export function paddedBinary(value: number, bitSize: number) {
  const binary = value.toString(2);
  if (binary.length > bitSize) {
    throw new Error(
      `Invalid value or bitSize: can't fit ${value} in ${bitSize} bits`,
    );
  }

  return binary.padStart(bitSize, "0");
}

export const notNone = paddedBinary(0, 1);
export const none = paddedBinary(1, 1);

export function isNone(bits: string) {
  return bits && bits.length >= 1 && bits[0] === none[0];
}

export function concat(encoded: CoderContext[]): CoderContext {
  return encoded.reduce(
    function (acc, obj) {
      return {
        bits: acc.bits + (obj.bits || ""),
        blob: acc.blob + (obj.blob || ""),
      };
    },
    { bits: "", blob: "" },
  );
}

const availableCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-";
const base = availableCharacters.length; // 64

export function toN(x: number) {
  if (x < 0) {
    throw new Error(`Invalid number: can't encode negative number ${x}`);
  }

  let result = "";
  while (x >= base) {
    result = availableCharacters[x % base] + result;
    x = Math.floor(x / base);
  }

  result = availableCharacters[x] + result;
  return result;
}

export function fromN(n: string) {
  let x = 0,
    index;
  for (let i = 0; i < n.length; i++) {
    index = availableCharacters.indexOf(n[i]!);
    if (index === -1) {
      throw new Error(`Invalid number: can't decode ${n}`);
    }
    x += index * Math.pow(base, n.length - i - 1);
  }
  return x;
}

export function fromVarN(string: string): [number, string] {
  let str = string;
  let value = 0;
  let hasMore = true;
  while (hasMore) {
    if (str.length === 0) {
      throw new Error(`Invalid number: can't decode ${string}`);
    }
    const byte = str[0];
    str = str.substr(1);
    const n = fromN(byte!);
    hasMore = n > 31;
    value = (value << 5) | (n & 31);
  }
  return [value, str];
}

export function toVarN(n: number) {
  let result = "";
  const charsRequired = Math.ceil(bitsRequired(n) / 5);
  let bits = paddedBinary(n, charsRequired * 5);
  while (bits) {
    let part = bits.substr(0, 5);
    bits = bits.substr(5);
    part = (bits.length === 0 ? "0" : "1") + part;
    result += bitsToN(part);
  }
  return result;
}

export function paddedN(x: number, charSize: number) {
  const r = toN(x);
  if (r.length > charSize) {
    throw new Error(`Invalid charSize: can't encode ${x} in ${charSize} chars`);
  }

  return r.padStart(charSize, availableCharacters[0]);
}

export function bitsToN(bits: string) {
  let result = "",
    char;
  while (bits) {
    char = bits.substr(0, 6);
    bits = bits.substr(6);

    if (char.length < 6) {
      char += "".padStart(6 - char.length, "0");
    }
    result += toN(parseInt(char, 2));
  }

  return result;
}

export function nToBits(chars: string, bitSize: number) {
  return Array.from(chars)
    .map((c) => paddedBinary(fromN(c), 6))
    .join("")
    .substr(0, bitSize);
}
