import {paddedBinary} from "./core";
import {register} from "./coder";

export default function integer() {
    return {
        encode: function (int) {
            var binary = Math.abs(int).toString(2);
            var bits = paddedBinary(binary.length, 6) + (int > 0 ? '1' : '0') + binary;
            return {bits, blob: ''};
        },
        decode: function ({bits, blob}) {
            var size = parseInt(bits.substr(0, 6), 2);
            bits = bits.substr(6);
            var sign = bits[0] === '1' ? 1 : -1;
            bits = bits.substr(1);
            return {
                value: sign * parseInt(bits.substr(0, size), 2),
                rest: { bits: bits.substr(size), blob }
            };
        }
    };
}

register('integer', integer);
