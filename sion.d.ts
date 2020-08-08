export declare const version = "1.1.0";
export declare const RE_HEXFLOAT: RegExp;
export declare const RE_HEXFLOAT_G: RegExp;
export declare const parseHexFloat: (str: string) => number;
export declare const toHexString: (num: number) => string;
export declare const stringify: (obj: any, replacer?: (any: any) => any, space?: (number | string), depth?: number) => any;
export declare const parse: (str: string) => any;
export declare const SION: {
    version: string;
    RE_HEXFLOAT: RegExp;
    RE_HEXFLOAT_G: RegExp;
    parseHexFloat: (str: string) => number;
    toHexString: (num: number) => string;
    stringify: (obj: any, replacer?: (any: any) => any, space?: (number | string), depth?: number) => any;
    parse: (str: string) => any;
};
