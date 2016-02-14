import {concat} from "./core";
import _ from "lodash";
import {register} from "./coder";

export function tuple(entries) {
    return {
        encode: function (array) {
            return concat(_.map(entries, (entry, i) => entry.encode(array[i])));
        },
        decode: function (rest) {
            var array = [];
            _.each(entries, (entry, i) => {
                var result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            });
            return {value: array, rest};
        }
    };
}

register('tuple', tuple);
