import { type Coder } from "./core.ts";

export function createRef<T>(initial = null) {
  let value: T | null = initial;
  return {
    get: () => value,
    set: (v: T | null) => {
      value = v;
    },
  };
}

export type Ref<T> = ReturnType<typeof createRef<T>>;

export default function ref(reference: Ref<Coder<any>>): Coder<any> {
  return {
    encode: function (value) {
      return reference.get()!.encode(value);
    },
    decode: function (rest) {
      return reference.get()!.decode(rest);
    },
  };
}
