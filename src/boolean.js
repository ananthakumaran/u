import oneOf from "./oneOf";
import {register} from "./coder";

export default function boolean() {
    return oneOf(true, false);
}

register('boolean', boolean);
