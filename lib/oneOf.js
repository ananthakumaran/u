"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = oneOf;

var _core = require("./core");

var _coder = require("./coder");

function oneOf() {
    for (var _len = arguments.length, choices = Array(_len), _key = 0; _key < _len; _key++) {
        choices[_key] = arguments[_key];
    }

    var bitSize = (0, _core.bitsRequired)(choices.length - 1);
    return {
        encode: function encode(choice) {
            var index = choices.indexOf(choice);
            if (index === -1) {
                throw new Error("Invalid choice: " + choice + " is not one of " + choices.join(','));
            }
            return { bits: (0, _core.paddedBinary)(index, bitSize), blob: '' };
        },

        decode: function decode(_ref) {
            var bits = _ref.bits;
            var blob = _ref.blob;

            var index = parseInt(bits.substr(0, bitSize), 2);
            return {
                value: choices[index],
                rest: { bits: bits.substring(bitSize), blob: blob }
            };
        }
    };
}

(0, _coder.register)('oneOf', oneOf);