"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = boolean;

var _oneOf = require("./oneOf");

var _oneOf2 = _interopRequireDefault(_oneOf);

var _coder = require("./coder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function boolean() {
    return (0, _oneOf2.default)(true, false);
}

(0, _coder.register)('boolean', boolean);