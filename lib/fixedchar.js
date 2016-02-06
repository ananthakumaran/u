'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fixedChar;

var _coder = require('./coder');

function fixedChar(size) {
    return {
        encode: function encode(string) {
            return { bits: '', blob: string.toString() };
        },
        decode: function decode(_ref) {
            var bits = _ref.bits;
            var blob = _ref.blob;

            return {
                value: blob.substr(0, size),
                rest: { bits: bits, blob: blob.substr(size) }
            };
        }
    };
}

(0, _coder.register)('fixedchar', fixedChar);