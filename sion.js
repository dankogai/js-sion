//
// sion.js
//
//                    1          2             3           4
const pat_hexfloat = '([\+\-]?)0x([0-9A-F]+)\.?([0-9A-F]*)p([\+\-]?[0-9]+)';
const RE_HEXFLOAT   = new RegExp(pat_hexfloat, 'i');
const RE_HEXFLOAT_G = new RegExp(pat_hexfloat, 'gi');
const parseHexFloat = (str) => {
    var m = RE_HEXFLOAT.exec(str);
    if (!m) {
        const mx = (/^([+-]?)inf(?:inity)?/i).exec(str);
        if (!mx) return NaN;
        return mx[1] == '-' ? -1/0 : 1/0;
    }
    const mantissa = parseInt(m[1] + m[2] + m[3], 16);
    const exponent = (m[4]|0) - 4*m[3].length;
    return mantissa * Math.pow(2, exponent);
};
const toHexString = (num) => {
    if (isNaN(num)) {
        return 'nan';
    }
    const n = +num;
    if (Object.is(n, +0.0)) {
        return '0x0p+0';
    } else if (Object.is(n, -0.0)) {
        return '-0x0p+0';
    } else if (!isFinite(n)) {
        return (n < 0 ? '-' : '') + 'inf';
    }
    const sign = n < 0 ? '-' : '';
    let a = Math.abs(n);
    let p = 0;
    if (a < 1) {
        while (a < 1)  { a *= 2; p-- }
    } else {
        while (a >= 2) { a /= 2; p++ }
    }
    const es = p < 0 ? '' : '+';
    return sign + '0x' + a.toString(16) + 'p' + es + p.toString(10);
};
var nodebuf;
if (typeof module !== 'undefined' && module.exports) {
    try {
        nodebuf = require('buffer').Buffer;
    } catch (err) {}
}
const ArrayBuffer2Base64 = (obj) => {
    if (!!Object.getPrototypeOf(obj,'buffer')) { 
        if (obj.buffer instanceof ArrayBuffer) {
            return nodebuf ? nodebuf.from(obj.buffer).toString('base64')
            : btoa(
                Array.from(new Uint8Array(obj.buffer, 0, obj.byteLength), 
                e => String.fromCharCode(e)).join('')
            )
        }
    }
    return undefined;
}
const stringify = (obj) => {
    if (obj == null) { return 'nil'; }
    if (obj instanceof Date) { 
        return '.Date(' + toHexString(obj.getTime() / 1000) + ')';
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(e => stringify(e)).join(',') + ']';
    }
    if (obj instanceof Map) {
        var a = []
        for (var [k, v] of obj) {
            a.push(stringify(k) + ':' + stringify(v));
        } 
        return a.length === 0 ? '[:]' : '[' + a.join(',') + ']';
    }
    const base64 = ArrayBuffer2Base64(obj);
    if (base64) { 
        return '.Data("' + base64 + '")';
    }
    switch (typeof obj) {
        case 'boolean':
            return obj.toString();
        case 'number':
            return (obj|0) === obj ? obj.toString() : toHexString(obj)
        case 'string':
            return JSON.stringify(obj)
        default:
             let a = Object.keys(obj).map(
                 k => stringify(k) + ':' + stringify(obj[k])
            )
            return a.length === 0 ? '[:]' : '[' + a.join(',') + ']';
    }
}
const s_null = "nil";
const s_bool = "true|false";
const s_double = "([+-]?)("
    + "0x[0-9a-fA-F]+(?:\\.[0-9a-fA-F]+)?(?:[pP][+-]?[0-9]+)"
    + "|(?:[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?"
    + "|0(?:\\.0+|(?:\\.0+)?(?:[eE][+-]?[0-9]+))"
    + "|(?:[Nn]a[Nn]|[Ii]nf(?:inity)?))";
const s_int = "([+-]?)(0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|[1-9][0-9]*|0)";
const s_date = ".Date\\(" + s_double + "\\)";
// aw…negative lookbehind is not yet available in many browsers
// so we replace all \" to \u0022 beforehand :-(
// const s_string  = "\"(.*?)(?<!\\\\)\"";
const s_string = '"([^"]*)"';;
const s_base64  = 
    "(?:[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/]+"
    + "[=]{0,3})?";
const s_data = ".Data\\(\"" + s_base64 + "\"\\)";
const s_comment = "//.*?(?:\n|\r|\r\n)";
const s_all = [ "\\[", "\\]", ":", ",",
    s_null, s_bool, s_date, s_double, s_int, s_data, s_string, s_comment
].join("|");
const reAll = new RegExp(s_all, 'gm');
const reDouble = new RegExp("^" + s_double + "$");
const reInt = new RegExp("^" + s_int + "$");
const tokenize = (str) =>  {
    let tokens = []
    let matches = []
    str = str.replace(/[\\]["]/g, '\\u0022'); // quick and dirty escape
    while ((matches = reAll.exec(str)) !== null) {
        if (matches[0].startsWith("//")) { continue; }
        tokens.push(matches[0]);
    }
    return tokens
}
const toBool = (str) =>  {
    return {"true":true, "false":false}[str];
}
const toDouble = (str) => {
    let m = reDouble.exec(str);
    if (!m) { return undefined; }
    let d = Number(m[0]);
    return isNaN(d) ? parseHexFloat(m[0]) : d;
}
const toInt = (str) => {
    let m = reInt.exec(str)
    if (!m) { return undefined; }
    let signum = m[1] === '-' ? -1 : +1;
    if (m[2].startsWith('0b')){ return signum * parseInt(m[2].substr(2), 2); }
    if (m[2].startsWith('0o')){ return signum * parseInt(m[2].substr(2), 8); }
    return parseInt(m[0]);
}
const toDate = (str) => {
    if (!str.startsWith('.Date(')) { return undefined; }
    if (!str.endsWith(')'))        { return undefined; }
    var d = toDouble(str.slice(6,-1));
    return isNaN(d) ? undefined : new Date(d * 1000);
}
const toString = (str) => {
    if (!str.startsWith('"')) { return undefined; }
    if (!str.endsWith('"'))   { return undefined; }
    return JSON.parse(str);
}
const toElement = (str) => {
    if (str === "nil") { return null; }
    let v = toBool(str); if (v !== undefined){ return v; }
    v = toDate(str);     if (v !== undefined){ return v; }
    v = toDouble(str);   if (v !== undefined){ return v; }
    v = toInt(str);      if (v !== undefined){ return v; }
    return toString(str);
}
const toCollection = (tokens) => {
    let isDictionary = 2 < tokens.length && tokens[2] === ":" || tokens[1] === ":"
    var elems = []
    var i = 1, d = 0
    while (i < tokens.length) {
        if (tokens[i] == "[") {
            var subtokens = ["["]
            d = 1; i += 1
            while (i < tokens.length) {
                if (tokens[i] == "[")       { d += 1 }
                else if (tokens[i] == "]")  { d -= 1 }
                subtokens.push(tokens[i])
                if (d == 0) { break; }
                i += 1
            }
            elems.push(toCollection(subtokens))
            continue;
        }
        const fuzz = new Set([":", ",", "[", "]"]);
        if (!fuzz.has(tokens[i])) {
            elems.push(toElement(tokens[i]))
        }
        i += 1
    }
    if (isDictionary) {
        // console.log(elems)
        var dict = new Map()
        while (elems.length !== 0) {
            let v = elems.pop()
            if (elems.length === 0) { return undefined; } // safety measure
            let k = elems.pop()
            dict.set(k, v)
        }
        var obj = {}
        for (var [k, v] of dict) {
            if (typeof k !== 'string') { return dict; }
            obj[k] = v
        }          
        return obj;
    } else {
        return elems;
    }
}
const parse = (str) => {
    let tokens = tokenize(str);
    return tokens.length === 0 ? undefined
        :  tokens.length === 1 ? toElement(tokens[0])
        :   tokens[0] == "["   ? toCollection(tokens)
        : undefined;
}
const SION = {
    version: "0.0.0",
    RE_HEXFLOAT: RE_HEXFLOAT,
    RE_HEXFLOAT_G: RE_HEXFLOAT_G,
    parseHexFloat: parseHexFloat,
    toHexString: toHexString,
    stringify:  stringify,
    tokenize: tokenize,
    parse: parse
};
export default SION;
