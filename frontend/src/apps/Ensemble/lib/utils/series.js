// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import strftime from "strftime";
import { randomColor, predictiveColor, historicalColor } from "./colors";
import { isNumber, isArray, isSerie } from "./datatype";
import { percentile, mean, parseNumber } from "./numpy";

const adjust_data = (data) => {

    if (data === undefined || data === null || data === false) {

        return [];

    } else if (isArray(data) && data.length > 0) {

        if (isNumber(data[0])) {
            return data.map((item) => parseNumber([item]));
        }

        else if (isArray(data[0]) && data[0].length === 1) {
            return data.map((item, j) => [new Date(j * 3600 * 24 * 1000).getTime(), parseNumber(item[0])]);
        }

        else if (isArray(data[0]) && data[0].length === 2) {
            return data.map((item) => [new Date(item[0]).getTime(), parseNumber(item[1])]);
        }

    } else if (isSerie(data)) {

        return {
            ...data,
            data: adjust_data(data.data)
        };
    };

    return data;
};

export const Serie = (forecast) => {
    let res = undefined;

    res = {
        ...forecast,
        name: forecast.name || `Serie ${strftime("%Y%m%d%H%M%S")}`,
        color: forecast.color || randomColor(),
        data: adjust_data(forecast.data),
        marker: false,
        lineWidth: 1,
        showInLegend: false,
        type: "spline",
    };

    //patch historical style
    if (res && res.historical) {
        res = {
            ...res,
            showInLegend: true,
            color: historicalColor,
            lineWidth: 2,
            marker: {
                enabled: false,
                symbol: "circle",
                fillColor: "white",
                lineWidth: 2,
                radius: 2,
                lineColor: historicalColor,
                zIndex: 999,
            },
            zIndex: 999,
            states: {
                hover: {
                    marker: {
                        enabled: true,
                    },
                }
            },
        };
    };

    return res;
};

export const Percentile = (forecasts_list, th, th1) => {
    let percentile_th = [];
    let percentile_th1 = [];
    forecasts_list = forecasts_list.map((item) => Serie(item));

    //fetch low water 
    let low_water = forecasts_list.filter((item) => item.lowWater)[0];
    let firstLowWater_th, firstLowWater_th1;
    //filter out historical and low water
    forecasts_list = forecasts_list.filter((item) => !item.historical && !item.lowWater);
    // inspect the first element of the list
    let first = forecasts_list[0];


    let n = forecasts_list[0].data.length;
    for (let j = 0; j < n; j++) {
        let arr = forecasts_list.map((item) => item.data[j][1]);

        let lower_percentile = percentile(arr, th);
        let higher_percentile = percentile(arr, th1);
        if(low_water.data.filter((item) => item[0] == first.data[j][0])[0][1] >= lower_percentile && !firstLowWater_th){
            firstLowWater_th = first.data[j][0];
        }
        if(low_water.data.filter((item) => item[0] == first.data[j][0])[0][1] >= higher_percentile && !firstLowWater_th1){
            firstLowWater_th1 = first.data[j][0];
        }
        percentile_th.push(lower_percentile);
        percentile_th1.push(higher_percentile);
    }
    // Area range series
    const data = percentile_th.map((item, index) => {
        return [first.data[index][0], item, percentile_th1[index]];
    });


    return [{
        name: `${th}-${th1}th Percentile forc.`,
        data: data,
        type: "areasplinerange",
        color: predictiveColor,
        lineWidth: 0,
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
            enabled: false,
        },
        states: {
            hover: {
                enabled: false
            }
        }
    }, firstLowWater_th, firstLowWater_th1];
};

export const EnsembleMean = (forecasts_list) => {
    let res = [];
    let low_water = forecasts_list.filter((item) => item.lowWater)[0];

    forecasts_list = forecasts_list.map((item) => Serie(item));
    //filter out historical 
    forecasts_list = forecasts_list.filter((item) => !item.historical && !item.lowWater);
    let first_low_water;
    let first = forecasts_list[0];

    let n = forecasts_list[0].data.length;

    for (let j = 0; j < n; j++) {


        let arr = forecasts_list.map((item) => item.data[j][1]);
        let mean_arr = mean(arr);
        if(low_water.data.filter((item) => item[0] == first.data[j][0])[0][1] >= mean_arr && !first_low_water){
            first_low_water = first.data[j][0];
        }
        res.push([first.data[j][0], mean_arr]);


    }

    return [{
        name: "Forecast ensemble mean",
        data: res,
        type: "spline",
        color: predictiveColor,
        marker: {
            enabled: false,
            fillColor: "white",
            lineWidth: 2,
            radius: 2,
            lineColor: predictiveColor,
            zIndex: 999,
        },
        zIndex: 999,
    }, first_low_water];
};

export const Historical = (forecasts_list) => {

    forecasts_list = forecasts_list.map((item) => Serie(item));
    //filter in historical 
    forecasts_list = forecasts_list.filter((item) => item.historical);
    if (forecasts_list.length === 0) {
        return { name: "Historical", data: [], type: "spline" };
    }
    return {
        name: forecasts_list[0].name,
        data: forecasts_list[0].data,
        type: "spline",
        color: historicalColor,
        dashStyle: "solid",
        marker: {
            enabled: false,
            symbol: "circle",
            fillColor: "white",
            lineWidth: 2,
            radius: 2,
            lineColor: historicalColor,
            zIndex: 999,
        },
        zIndex: 999,
        states: {
            hover: {
                marker: {
                    enabled: true,
                },
            }
        }
    };
};

export const LowWater = (forecasts_list) => {

    forecasts_list = forecasts_list.map((item) => Serie(item));
    //filter in low water 
    forecasts_list = forecasts_list.filter((item) => item.lowWater);
    if (forecasts_list.length === 0) {
        return { name: "Laag Water", data: [], type: "spline" };
    }
    return {
        name: `Laag Water`,
        data: forecasts_list[0].data,
        type: "spline",
        color: "red",
        dashStyle: "dash",
        label: {
            enabled:true,
            style: {
                color: "red",
                fontWeight: "bold",
                fontSize: "10px",
            },
            // useHTML: true,
        },
        marker: {
            enabled: false,
            symbol: "circle",
            fillColor: "white",
            lineWidth: 2,
            radius: 2,
            lineColor: "red",
            zIndex: 999,
        },
        zIndex: 999,
        states: {
            hover: {
                marker: {
                    enabled: true,
                },
            }
        }
    };
};

export const minDate = (forecasts_list) => {
    forecasts_list = forecasts_list.map((item) => Serie(item));
    if (forecasts_list.length === 0) {
        return undefined;
    }
    return Math.min(...forecasts_list.map((item) => item.data[0][0]));
};

export const historicalThreshold = (forecasts_list) => {
    forecasts_list = forecasts_list.map((item) => Serie(item));
    //filter out historical
    forecasts_list = forecasts_list.filter((item) => (!item.historical && !item.lowWater));
    if (forecasts_list.length === 0) {
        return undefined;
    }
    return Math.min(...forecasts_list.map((item) => item.data[0][0]));
};

export const percentileLongTermObs = (forecasts_list, th) => {

    forecasts_list = forecasts_list.map((item) => Serie(item));
    //filter in historical
    forecasts_list = forecasts_list.filter((item) => item.historical);
    if (forecasts_list.length === 0) {
        return 0;
    }
    // catenate all historical data
    let data = [];
    forecasts_list.forEach((item) => {
        data = data.concat(item.data);
    });
    // compute percentile
    return percentile(data.map((item) => item[1]), th);
};