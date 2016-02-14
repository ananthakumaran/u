'use strict';

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _repeat = require('lodash/repeat');

var _repeat2 = _interopRequireDefault(_repeat);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.none = exports.notNone = undefined;
exports.bitsRequired = bitsRequired;
exports.paddedBinary = paddedBinary;
exports.isNone = isNone;
exports.concat = concat;
exports.toN = toN;
exports.fromN = fromN;
exports.fromVarN = fromVarN;
exports.toVarN = toVarN;
exports.paddedN = paddedN;
exports.bitsToN = bitsToN;
exports.nToBits = nToBits;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bitsRequired(maxValue) {
    if (maxValue === 0) {
        return 1;
    }
    return Math.floor(Math.log(maxValue) / Math.LN2) + 1;
}

function paddedBinary(value, bitSize) {
    var binary = value.toString(2);
    if (binary.length > bitSize) {
        throw new Error('Invalid value or bitSize: can\'t fit ' + value + ' in ' + bitSize + ' bits');
    }

    return (0, _repeat2.default)('0', bitSize - binary.length) + binary;
}

var notNone = exports.notNone = paddedBinary(0, 1);
var none = exports.none = paddedBinary(1, 1);

function isNone(bits) {
    return bits && bits.length >= 1 && bits[0] === none[0];
}

function concat(encoded) {
    return (0, _reduce2.default)(encoded, function (acc, obj) {
        return { bits: acc.bits + (obj.bits || ''), blob: acc.blob + (obj.blob || '') };
    }, { bits: '', blob: '' });
}

var availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-';
var base = availableCharacters.length; // 64

function toN(x) {
    if (x < 0) {
        throw new Error('Invalid number: can\'t encode negative number ' + x);
    }

    var result = '';
    while (x >= base) {
        result = availableCharacters[x % base] + result;
        x = Math.floor(x / base);
    }

    result = availableCharacters[x] + result;
    return result;
}

function fromN(n) {
    var x = 0,
        index;
    for (var i = 0; i < n.length; i++) {
        index = availableCharacters.indexOf(n[i]);
        if (index === -1) {
            throw new Error('Invalid number: can\'t decode ' + n);
        }
        x += index * Math.pow(base, n.length - i - 1);
    }
    return x;
}

function fromVarN(string) {
    var str = string;
    var value = 0;
    var hasMore = true;
    while (hasMore) {
        if (str.length === 0) {
            throw new Error('Invalid number: can\'t decode ' + string);
        }
        var byte = str[0];
        str = str.substr(1);
        var n = fromN(byte);
        hasMore = n > 31;
        value = value << 5 | n & 31;
    }
    return [value, str];
}

function toVarN(n) {
    var result = '';
    var charsRequired = Math.ceil(bitsRequired(n) / 5);
    var bits = paddedBinary(n, charsRequired * 5);
    while (bits) {
        var part = bits.substr(0, 5);
        bits = bits.substr(5);
        part = (bits.length === 0 ? '0' : '1') + part;
        result += bitsToN(part);
    }
    return result;
}

function paddedN(x, charSize) {
    var r = toN(x);
    if (r.length > charSize) {
        throw new Error('Invalid charSize: can\'t encode ' + x + ' in ' + charSize + ' chars');
    }

    return (0, _repeat2.default)(availableCharacters[0], charSize - r.length) + r;
}

function bitsToN(bits) {
    var result = '',
        char;
    while (bits) {
        char = bits.substr(0, 6);
        bits = bits.substr(6);

        if (char.length < 6) {
            char += (0, _repeat2.default)('0', 6 - char.length);
        }
        result += toN(parseInt(char, 2));
    }

    return result;
}

function nToBits(chars, bitSize) {
    return (0, _map2.default)(chars, function (c) {
        return paddedBinary(fromN(c), 6);
    }).join('').substr(0, bitSize);
}