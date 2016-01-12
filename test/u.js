import {fromJson, encode, decode} from "../index";
import {nToBits, bitsToN, fromN, toN, paddedBinary} from "../src/core";
import jsc from "jsverify";
import _ from "lodash";
import util from "util";
import assert from "assert";

var oneOf = jsc.nearray(jsc.json).smap((array) => {
    var r = jsc.random(0, array.length - 1);
    return [['oneOf'].concat(array), array[r]];
}, (x) => _.rest(x[0]));

var boolean = jsc.bool.smap(bool => {
    return [['boolean'], bool];
}, ([spec, value]) => value);

var integer = jsc.integer.smap(n => {
    return [['integer'], n];
}, ([spec, value]) => value);

var wrap = (object) => {
    var spec = {}, sample = {};
    _.each(object, (value, key) => {
        spec[key] = value[0];
        if (jsc.random(0, 5) !== 0) {
            sample[key] = value[1];
        }
    });
    return [spec, sample];
};

var unwrap = (value) => {
    var spec = value[0], sample = value[1];
    var result = {};
    _.each(spec, (value, key) => {
        result[key] = [value, sample[key]];
    });
    return result;
};

var wrapArray = (array) => {
    return [['array'].concat(_.map(array, ([spec, value]) => spec)), _.map(array, ([spec, value]) => value)];
};

var unwrapArray = (wrapped) => {
    return _.map(_.rest(wrapped[0]), (spec, i) => [spec, wrapped[1][i]]);
};

var generateObject = jsc.generator.recursive(
    jsc.generator.oneof([oneOf.generator, boolean.generator, integer.generator]),
    function (gen) {
        return jsc.generator.oneof([jsc.generator.dict(gen).map(wrap), jsc.generator.nearray(gen).map(wrapArray)]);
    }
);

var shrinkObject = jsc.shrink.bless((value) => {
    var spec = value[0];
    if (_.isArray(spec)) {
        var type = spec[0];
        switch (type) {
        case 'oneOf': return oneOf.shrink(value);
        case 'boolean': return boolean.shrink(value);
        case 'array': return jsc.shrink.nearray(shrinkObject)(unwrapArray(value)).map(wrapArray);
        case 'integer': return integer.shrink(value);
        default: throw new Error(`Invalid type ${type}`);
        }
    } else {
        return shrinkDictObject(unwrap(value)).map(wrap);
    }
});

var shrinkDictObject = (() => {
    var pairShrink = jsc.shrink.pair(jsc.string.shrink, shrinkObject);
    var arrayShrink = jsc.shrink.array(pairShrink);

    return arrayShrink.smap(jsc.utils.pairArrayToDict, jsc.utils.dictToPairArray);
})();

var object = jsc.bless({
    generator: generateObject,
    shrink: shrinkObject,
    show: jsc.show
});

function validate(generator, debug) {
    return function () {
        this.timeout(Infinity);
        jsc.assert(jsc.forall(generator, (x) => {
            var [spec, value] = x;
            var coder = fromJson(1, spec);
            var encoded = encode(coder, value);
            var decoded = decode(coder, encoded);
            if (!_.isEqual(value, decoded)) {
                console.log('spec ', spec);
                console.log('value', util.inspect(value, {depth: null}));
                console.log('encoded', encoded);
                console.log('decoded', util.inspect(decoded, {depth: null}));
            }
            return _.isEqual(decoded, value);
        }));
    };
}

function validateExample(spec, value) {
    return () => {
        var coder = fromJson(1, spec);
        var encoded = encode(coder, value);
        var decoded = decode(coder, encoded);
        if (!_.isEqual(value, decoded)) {
            console.log('spec ', spec);
            console.log('value', util.inspect(value, {depth: null}));
            console.log('encoded', encoded);
            console.log('decoded', util.inspect(decoded, {depth: null}));
        }

        assert.deepEqual(value, decoded);
    };
}

describe('u', () => {
    describe('primitives', () => {
        it('oneOf', validate(oneOf));
        it('boolean', validate(boolean));
        it('number', validate(integer));
        it('object', validate(object));

        it('should handle unspecified keys', () => {
            validateExample({'a': {'a': ['boolean']}}, {})();
            validateExample({'a': {'a': ['boolean']}}, {a: {a: false}});
            validateExample({'a': {'a': ['boolean'], 'b': ['boolean']}}, {a: {b: false}});
        });
    });

    describe('core', () => {
        it('should pad numbers', () => {
            jsc.assert(jsc.forall("nat", (x) => {
                return _.isEqual(parseInt(paddedBinary(x, 64), 2), x);
            }));
        });

        it('should encode decode bits', () => {
            jsc.assert(jsc.forall("nearray nat", (xs) => {
                var bits = _.map(xs, x => x.toString(2)).join('');
                return _.isEqual(nToBits(bitsToN(bits), bits.length), bits);
            }));
        });

        it('should encode decode numbers', () => {
            jsc.assert(jsc.forall('nat', (n) => {
                return _.isEqual(fromN(toN(n)), n);
            }));
        });
    });
});
