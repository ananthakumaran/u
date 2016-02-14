"use strict";

var _each = require("lodash/each");

var _each2 = _interopRequireDefault(_each);

var _map = require("lodash/map");

var _map2 = _interopRequireDefault(_map);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tuple = tuple;

var _core = require("./core");

var _coder = require("./coder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tuple(entries) {
    return {
        encode: function encode(array) {
            return (0, _core.concat)((0, _map2.default)(entries, function (entry, i) {
                return entry.encode(array[i]);
            }));
        },
        decode: function decode(rest) {
            var array = [];
            (0, _each2.default)(entries, function (entry, i) {
                var result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            });
            return { value: array, rest: rest };
        }
    };
}

(0, _coder.register)('tuple', tuple);