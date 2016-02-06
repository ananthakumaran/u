"use strict";

var _fromPairs = require("lodash/fromPairs");

var _fromPairs2 = _interopRequireDefault(_fromPairs);

var _keys = require("lodash/keys");

var _keys2 = _interopRequireDefault(_keys);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _tail = require("lodash/tail");

var _tail2 = _interopRequireDefault(_tail);

var _map = require("lodash/map");

var _map2 = _interopRequireDefault(_map);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _reduce = require("lodash/reduce");

var _reduce2 = _interopRequireDefault(_reduce);

var _filter = require("lodash/filter");

var _filter2 = _interopRequireDefault(_filter);

var _sortBy = require("lodash/sortBy");

var _sortBy2 = _interopRequireDefault(_sortBy);

var _find = require("lodash/find");

var _find2 = _interopRequireDefault(_find);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.register = register;
exports.encode = encode;
exports.decode = decode;
exports.fromJson = fromJson;

var _core = require("./core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var availableTypes = {};

function register(name, type) {
    availableTypes[name] = type;
}

function encode(coder, object) {
    var _coder$spec$encode = coder.spec.encode(object);

    var bits = _coder$spec$encode.bits;
    var blob = _coder$spec$encode.blob;

    return coder.encodedVersion + (0, _core.paddedN)(bits.length, 2) + (0, _core.bitsToN)(bits) + blob;
}

function decode(coders, string) {
    var version = (0, _core.fromN)(string.substr(0, 2)),
        bitSize = (0, _core.fromN)(string.substr(2, 2));

    var coder = (0, _find2.default)(coders, function (c) {
        return c.version === version;
    });
    if (!coder) {
        throw new Error("Invalid version: " + version);
    }

    var bitCharSize = Math.ceil(bitSize / 6);
    var bits = (0, _core.nToBits)(string.substr(4, bitCharSize), bitSize);
    var blob = string.substr(4 + bitCharSize);
    var result = coder.spec.decode({ bits: bits, blob: blob });
    var pendingMigrations = (0, _sortBy2.default)((0, _filter2.default)(coders, function (coder) {
        return coder.version > version;
    }), 'version');
    return (0, _reduce2.default)(pendingMigrations, function (value, coder) {
        return coder.migrate(value);
    }, result.value);
}

function fromJson(version, jsonSpec, migrate) {
    function loop(spec) {
        if ((0, _isArray2.default)(spec)) {
            var method = spec[0];
            if (method === 'array') {
                return availableTypes.array((0, _map2.default)((0, _tail2.default)(spec), loop));
            } else {
                return availableTypes[method].apply(null, (0, _tail2.default)(spec));
            }
        } else if ((0, _isObject2.default)(spec)) {
            var entries = (0, _keys2.default)(spec).sort();
            return availableTypes.object((0, _fromPairs2.default)((0, _map2.default)(entries, function (key) {
                return [key, loop(spec[key])];
            })));
        }
    }

    return {
        version: version,
        spec: loop(jsonSpec),
        jsonSpec: jsonSpec,
        encodedVersion: (0, _core.paddedN)(version, 2),
        migrate: migrate || function (x) {
            return x;
        }
    };
}