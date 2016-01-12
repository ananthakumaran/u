import _ from "lodash";

export function bitsRequired(maxValue) {
    if (maxValue === 0) {
        return 1;
    }
    return Math.floor(Math.log(maxValue) / Math.LN2) + 1;
}

export function paddedBinary(value, bitSize) {
    var binary = value.toString(2);
    if (binary.length > bitSize) {
        throw new Error(`Invalid value or bitSize: can't fit ${value} in ${bitSize} bits`);
    }

    return _.repeat('0', bitSize - binary.length) + binary;
}

export var notNone = paddedBinary(0, 1);
export var none = paddedBinary(1, 1);

export function isNone(bits) {
    return (bits && bits.length >= 1 && bits[0] === none[0]);
}

export function concat(encoded) {
    return _.reduce(encoded, function (acc, obj) {
        return {bits: acc.bits + (obj.bits || ''), blob: acc.blob + (obj.blob || '')};
    }, {bits: '', blob: ''});
}

var availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-';
var base = availableCharacters.length; // 64

export function toN(x) {
    if (x < 0) {
        throw new Error(`Invalid number: can't encode negative number ${x}`);
    }

    var result = '';
    while (x > base) {
        result = availableCharacters[x % base] + result;
        x = Math.floor(x / base);
    }

    result = availableCharacters[x] + result;
    return result;
}

export function fromN(n) {
    var x = 0,
        index;
    for (var i = 0; i < n.length; i++) {
        index = availableCharacters.indexOf(n[i]);
        if (index === -1) {
            throw new Error(`Invalid number: can't decode ${n}`);
        }
        x += index * Math.pow(base, n.length - i - 1);
    }
    return x;
}

export function paddedN(x, charSize) {
    var r = toN(x);
    if (r.length > charSize) {
        throw new Error(`Invalid charSize: can't encode ${x} in ${charSize} chars`);
    }

    return _.repeat(availableCharacters[0], charSize - r.length) + r;
}

export function bitsToN(bits) {
    if (bits === '') {
        return '';
    }

    var char = bits.substr(0, 6);
    bits = bits.substr(6);

    if (char.length < 6) {
        char += _.repeat(0, 6 - char.length);
    }

    return toN(parseInt(char, 2)) + bitsToN(bits);
}

export function nToBits(chars, bitSize) {
    return _.map(chars, c => paddedBinary(fromN(c), 6)).join('').substr(0, bitSize);
}
