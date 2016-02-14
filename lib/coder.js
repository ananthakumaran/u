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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

    return coder.encodedVersion + (0, _core.toVarN)(bits.length) + (0, _core.bitsToN)(bits) + blob;
}

function decode(coders, string) {
    var version, bitSize;

    var _fromVarN = (0, _core.fromVarN)(string);

    var _fromVarN2 = _slicedToArray(_fromVarN, 2);

    version = _fromVarN2[0];
    string = _fromVarN2[1];

    var _fromVarN3 = (0, _core.fromVarN)(string);

    var _fromVarN4 = _slicedToArray(_fromVarN3, 2);

    bitSize = _fromVarN4[0];
    string = _fromVarN4[1];

    var coder = (0, _find2.default)(coders, function (c) {
        return c.version === version;
    });
    if (!coder) {
        throw new Error("Invalid version: " + version);
    }

    var bitCharSize = Math.ceil(bitSize / 6);
    var bits = (0, _core.nToBits)(string.substr(0, bitCharSize), bitSize);
    var blob = string.substr(bitCharSize);
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
            if (method === 'tuple') {
                return availableTypes.tuple((0, _map2.default)((0, _tail2.default)(spec), loop));
            } else if (method === 'array') {
                return availableTypes.array(loop(spec[1]));
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
        encodedVersion: (0, _core.toVarN)(version),
        migrate: migrate || function (x) {
            return x;
        }
    };
}