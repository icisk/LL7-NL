// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import * as ss from "simple-statistics";

// create an 1d-array of length n
// like numpy.empty(n)
export const empty = (size) => new Array(size);

export const parseNumber = (value) => {
    value = parseFloat(value);
    return isNaN(value) ? undefined : value;
};

export const percentile = (data, p) => {
    //filter out undefined values
    data = data.filter((item) => item !== undefined);
    return parseNumber(ss.quantile(data, p / 100));
};

export const mean = (data) => {
    //filter out undefined values
    data = data.filter((item) => item !== undefined);
    return parseNumber(ss.mean(data));
};