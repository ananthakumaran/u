import _ from "lodash";
import {bitsToN, nToBits, fromVarN, toVarN} from "./core";

var availableTypes = {};

export function register(name, type) {
    availableTypes[name] = type;
}

export function encode(coder, object) {
    var {bits, blob} = coder.spec.encode(object);
    return coder.encodedVersion + toVarN(bits.length) + bitsToN(bits) + blob;
}

export function decode(coders, string) {
    var version, bitSize;
    [version, string] = fromVarN(string);
    [bitSize, string] = fromVarN(string);

    var coder = _.find(coders, c => c.version === version);
    if (!coder) {
	throw new Error(`Invalid version: ${version}`);
    }

    var bitCharSize = Math.ceil(bitSize / 6);
    var bits = nToBits(string.substr(0, bitCharSize), bitSize);
    var blob = string.substr(bitCharSize);
    var result = coder.spec.decode({bits, blob});
    var pendingMigrations = _.sortBy(_.filter(coders, coder => coder.version > version), 'version');
    return _.reduce(pendingMigrations, (value, coder) => coder.migrate(value), result.value);
}

export function fromJson(version, jsonSpec, migrate) {
    function loop(spec) {
	if (_.isArray(spec)) {
	    var method = spec[0];
	    if (method === 'tuple') {
		return availableTypes.tuple(_.map(_.tail(spec), loop));
	    } else if (method === 'array') {
		return availableTypes.array(loop(spec[1]));
            } else {
		return availableTypes[method].apply(null, _.tail(spec));
	    }
	} else if (_.isObject(spec)) {
	    var entries = _.keys(spec).sort();
	    return availableTypes.object(_.fromPairs(_.map(entries, function (key) {
                return [key, loop(spec[key])];
	    })));
	}
    }

    return {
	version: version,
	spec: loop(jsonSpec),
	jsonSpec: jsonSpec,
	encodedVersion: toVarN(version),
	migrate: migrate || (x => x)
    };
}
