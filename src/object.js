import {concat, isNone, none, notNone} from "./core";
import _ from "lodash";
import {register} from "./coder";

export function object(entries) {
    return {
	encode: function (object) {
            return concat(
                _.flatten(_.map(entries, function (entry, key) {
		    if (_.has(object, key)) {
			return [{bits: notNone}, entry.encode(object[key])];
		    }
                    return {bits: none};
	        })));
	},
	decode: function ({bits, blob}) {
	    var object = {};
	    _.each(entries, function (entry, key) {
		if (isNone(bits)) {
		    bits = bits.substr(1);
		    return;
		} else {
                    bits = bits.substr(1);
                }

		var result = entry.decode({bits, blob});
		bits = result.rest.bits;
                blob = result.rest.blob;
		object[key] = result.value;
	    });
	    return { value: object, rest: {bits, blob} };
	}
    };
}

register('object', object);
