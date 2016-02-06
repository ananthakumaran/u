"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = varchar;

var _core = require("./core");

var _coder = require("./coder");

function varchar(maxSize) {
    var bitSize = (0, _core.bitsRequired)(maxSize);
    return {
        encode: function encode(string) {
            return { bits: (0, _core.paddedBinary)(string.length, bitSize), blob: string };
        },
        decode: function decode(_ref) {
            var bits = _ref.bits;
            var blob = _ref.blob;

            var size = parseInt(bits.substr(0, bitSize), 2);
            return {
                value: blob.substr(0, size),
                rest: { bits: bits.substr(bitSize), blob: blob.substr(size) }
            };
        }
    };
}

(0, _coder.register)('varchar', varchar);