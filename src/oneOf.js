import {paddedBinary, bitsRequired} from "./core";
import {register} from "./coder";

export default function oneOf(...choices) {
    var bitSize = bitsRequired(choices.length - 1);
    return {
        encode: function (choice) {
            var index = choices.indexOf(choice);
            if (index === -1) {
                throw new Error(`Invalid choice: ${choice} is not one of ${choices.join(',')}`);
            }
            return {bits: paddedBinary(index, bitSize), blob: ''};
        },

        decode: function ({bits, blob}) {
            var index = parseInt(bits.substr(0, bitSize), 2);
            return {
                value: choices[index],
                rest: { bits: bits.substring(bitSize), blob }
            };
        }
    };
}

register('oneOf', oneOf);
