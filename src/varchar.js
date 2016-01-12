import {paddedBinary, bitsRequired} from "./core";
import {register} from "./coder";

export default function varchar(maxSize) {
    var bitSize = bitsRequired(maxSize);
    return {
        encode: function (string) {
            return {bits: paddedBinary(string.length, bitSize), blob: string};
        },
        decode: function ({bits, blob}) {
            var size = parseInt(bits.substr(0, bitSize), 2);
            return {
                value: blob.substr(0, size),
                rest: { bits: bits.substr(bitSize), blob: blob.substr(size) }
            };
        }
    };
}

register('varchar', varchar);
