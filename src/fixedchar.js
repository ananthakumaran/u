import {register} from "./coder";

export default function fixedChar(size) {
    return {
        encode: function (string) {
            return {bits: '', blob: string.toString()};
        },
        decode: function ({bits, blob}) {
            return {
                value: blob.substr(0, size),
                rest: { bits, blob: blob.substr(size) }
            };
        }
    };
}

register('fixedchar', fixedChar);
