// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0


import Highcharts from "highcharts/highstock";

export const black = "#000000";
export const gray = "#999999";
export const red = "#ab221d";
export const blue = "#345592";

export const historicalColor = Highcharts.getOptions().colors[4];
export const predictiveColor = Highcharts.getOptions().colors[0];

export const randomColor = () => highchartsColor();

var color = 0;
function highchartsColor() { 
    color++;
    return Highcharts.getOptions().colors[color];
};