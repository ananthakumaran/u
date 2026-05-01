import { repeat, map, reduce } from "lodash-es";

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
  var binary = value.toString(2);
  if (binary.length > bitSize) {
    throw new Error(
      `Invalid value or bitSize: can't fit ${value} in ${bitSize} bits`,
    );
  }

  return repeat("0", bitSize - binary.length) + binary;
}

export var notNone = paddedBinary(0, 1);
export var none = paddedBinary(1, 1);

export function isNone(bits: string) {
  return bits && bits.length >= 1 && bits[0] === none[0];
}

export function concat(encoded: CoderContext[]): CoderContext {
  return reduce(
    encoded,
    function (acc, obj) {
      return {
        bits: acc.bits + (obj.bits || ""),
        blob: acc.blob + (obj.blob || ""),
      };
    },
    { bits: "", blob: "" },
  );
}

var availableCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-";
var base = availableCharacters.length; // 64

export function toN(x: number) {
  if (x < 0) {
    throw new Error(`Invalid number: can't encode negative number ${x}`);
  }

  var result = "";
  while (x >= base) {
    result = availableCharacters[x % base] + result;
    x = Math.floor(x / base);
  }

  result = availableCharacters[x] + result;
  return result;
}

export function fromN(n: string) {
  var x = 0,
    index;
  for (var i = 0; i < n.length; i++) {
    index = availableCharacters.indexOf(n[i]!);
    if (index === -1) {
      throw new Error(`Invalid number: can't decode ${n}`);
    }
    x += index * Math.pow(base, n.length - i - 1);
  }
  return x;
}

export function fromVarN(string: string): [number, string] {
  var str = string;
  var value = 0;
  var hasMore = true;
  while (hasMore) {
    if (str.length === 0) {
      throw new Error(`Invalid number: can't decode ${string}`);
    }
    var byte = str[0];
    str = str.substr(1);
    var n = fromN(byte!);
    hasMore = n > 31;
    value = (value << 5) | (n & 31);
  }
  return [value, str];
}

export function toVarN(n: number) {
  var result = "";
  var charsRequired = Math.ceil(bitsRequired(n) / 5);
  var bits = paddedBinary(n, charsRequired * 5);
  while (bits) {
    var part = bits.substr(0, 5);
    bits = bits.substr(5);
    part = (bits.length === 0 ? "0" : "1") + part;
    result += bitsToN(part);
  }
  return result;
}

export function paddedN(x: number, charSize: number) {
  var r = toN(x);
  if (r.length > charSize) {
    throw new Error(`Invalid charSize: can't encode ${x} in ${charSize} chars`);
  }

  return repeat(availableCharacters[0], charSize - r.length) + r;
}

export function bitsToN(bits: string) {
  var result = "",
    char;
  while (bits) {
    char = bits.substr(0, 6);
    bits = bits.substr(6);

    if (char.length < 6) {
      char += repeat("0", 6 - char.length);
    }
    result += toN(parseInt(char, 2));
  }

  return result;
}

export function nToBits(chars: string, bitSize: number) {
  return map(chars, (c) => paddedBinary(fromN(c), 6))
    .join("")
    .substr(0, bitSize);
}
