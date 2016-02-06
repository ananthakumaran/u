"use strict";

var _each = require("lodash/each");

var _each2 = _interopRequireDefault(_each);

var _has = require("lodash/has");

var _has2 = _interopRequireDefault(_has);

var _map = require("lodash/map");

var _map2 = _interopRequireDefault(_map);

var _flatten = require("lodash/flatten");

var _flatten2 = _interopRequireDefault(_flatten);

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.object = object;

var _core = require("./core");

var _coder = require("./coder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function object(entries) {
	return {
		encode: function encode(object) {
			return (0, _core.concat)((0, _flatten2.default)((0, _map2.default)(entries, function (entry, key) {
				if ((0, _has2.default)(object, key)) {
					return [{ bits: _core.notNone }, entry.encode(object[key])];
				}
				return { bits: _core.none };
			})));
		},
		decode: function decode(_ref) {
			var bits = _ref.bits;
			var blob = _ref.blob;

			var object = {};
			(0, _each2.default)(entries, function (entry, key) {
				if ((0, _core.isNone)(bits)) {
					bits = bits.substr(1);
					return;
				} else {
					bits = bits.substr(1);
				}

				var result = entry.decode({ bits: bits, blob: blob });
				bits = result.rest.bits;
				blob = result.rest.blob;
				object[key] = result.value;
			});
			return { value: object, rest: { bits: bits, blob: blob } };
		}
	};
}

(0, _coder.register)('object', object);