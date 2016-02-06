"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = integer;

var _core = require("./core");

var _coder = require("./coder");

function integer() {
    return {
        encode: function encode(int) {
            var binary = Math.abs(int).toString(2);
            var bits = (0, _core.paddedBinary)(binary.length, 6) + (int > 0 ? '1' : '0') + binary;
            return { bits: bits, blob: '' };
        },
        decode: function decode(_ref) {
            var bits = _ref.bits;
            var blob = _ref.blob;

            var size = parseInt(bits.substr(0, 6), 2);
            bits = bits.substr(6);
            var sign = bits[0] === '1' ? 1 : -1;
            bits = bits.substr(1);
            return {
                value: sign * parseInt(bits.substr(0, size), 2),
                rest: { bits: bits.substr(size), blob: blob }
            };
        }
    };
}

(0, _coder.register)('integer', integer);