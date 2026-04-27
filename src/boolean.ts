import oneOf from "./oneOf.ts";
import type { Coder } from "./core.ts";

export default function boolean(): Coder<boolean> {
  return oneOf(true, false);
}
