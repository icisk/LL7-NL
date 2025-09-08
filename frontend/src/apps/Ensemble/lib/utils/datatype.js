// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

export const isString = (value) => {
    return typeof value === "string" || value instanceof String;
};

export const isNumber = (value) => {
    return typeof value === "number" && isFinite(value);
};

export const isDate = (value) => {
    return value instanceof Date;
};

export const isObject = (value) => {
    return value && typeof value === "object";
};

export const isArray = (value) => {
    return value && Array.isArray(value);
};

export const isArrayOfArrays = (value) => {
    return value && Array.isArray(value) && Array.isArray(value[0]);
};

export const isFunction = (value) => {
    return typeof value === "function";
};

export const isBoolean = (value) => {
    return typeof value === "boolean";
};

export const isNull = (value) => {
    return value === null;
};

export const isUndefined = (value) => {
    return typeof value === "undefined";
};

export const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isInteger = (value) => {
    return Number.isInteger(value);
};

export const isFloat = (value) => {
    return Number.isFinite(value) && !Number.isInteger(value);
};

export const notanumber = (value) => {
    return isNaN(value) || value === Infinity || value === -Infinity || value === null || value === undefined || value === "" || value === false;
};

export const isDict = (value) => {
    return value && typeof value === "object" && value.constructor === Object;
};

export const isSerie = (value) => {
    return value && typeof value === "object" && value.constructor === Object && value.data && value.name;
};
