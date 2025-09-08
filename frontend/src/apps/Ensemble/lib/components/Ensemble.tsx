// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import Accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import HighchartsAnnotations from "highcharts/modules/annotations";
// @ts-expect-error dont need types here
import { EnsembleMean, Percentile, Historical,Serie, historicalThreshold, LowWater } from "../utils/series";

HighchartsMore(Highcharts);
Accessibility(Highcharts);
HighchartsAnnotations(Highcharts);

const VerticalLine = (date:number, text:string, type:string) => {
    let color;
    let dashStyle;
    if (!date) return [];
    if(type == "info"){
        color = "grey";
        dashStyle = "solid";}
    if(type == "warning"){
        color = "orange";
        dashStyle = "dash";
    }
    return [{
        color: color,
        dashType: dashStyle,
        width: 2.5,
        value: date,
        zIndex: 3,
        label: {
            enabled: false,
            text: text,
            align: "right",
            rotation: 270,
            style: {
                color: "#999999",
                fontWeight: "bold",
                fontSize: "10px",
            },
            y: 0,
            x: 10
        },
    }];
};

interface Forecast{
    name:string,
    historical?: boolean, 
    lowWater?:boolean,
    data?:[string, number][]
}

interface Props{
    varname:string, 
    key:string, 
    um:string,
    type:string,
    series: Forecast[],
    showHistoricals:boolean
}
const Ensemble = (props:Props) => {
    const varname = props.varname || "Variable";
    const um = props.um || "";
    const series = props.series.map((item:Forecast) => Serie(item));

    let series2display = series.filter((item:Forecast) => (item.name !== "Laag Water" && item.name !== "Historical"));
    const today = new Date();
    const todayTime = new Date(today.getFullYear().toString() + "/" +  (today.getMonth() + 1).toString() + "/" + today.getDate()).getTime();
    let minDate = series[0].data[0][0];
    const maxDate = series[0].data.slice(-1)[0][0];
    let plotLines = VerticalLine(todayTime, "Today", "info").concat(props.showHistoricals ? VerticalLine(historicalThreshold(series), "&#x2193; Forecasts &#x2193;", "info") : []);

    if (props.type === "ensemble") {
        const [percentile_30, first_low_water_30, first_low_water_70] = Percentile(series, 30, 70);
        const [percentile_10, first_low_water_10, first_low_water_90] = Percentile(series, 10, 90);
        const [percentile_50, first_low_water_50] = EnsembleMean(series);
        
        series2display = [
            percentile_50,
            percentile_30,
            percentile_10,
        ];
        if (props.showHistoricals) {
            series2display.push(Historical(series));
            minDate = series.filter((item:Forecast) => item.name == "Historical")[0].data[0][0];
        }
        series2display.push(LowWater(series));
        if(first_low_water_10){
            plotLines = plotLines.concat(VerticalLine(first_low_water_10, "10 % Laag Water!", "warning"));
        }
        if(first_low_water_30){
            plotLines = plotLines.concat(VerticalLine(first_low_water_30, "30 % Laag Water!", "warning"));
        }
        if(first_low_water_50){
            plotLines = plotLines.concat(VerticalLine(first_low_water_50, "50 % Laag Water!", "warning"));
        }
        if(first_low_water_70){
            plotLines = plotLines.concat(VerticalLine(first_low_water_70, "70 % Laag Water!", "warning"));
        }
        if(first_low_water_90){
            plotLines = plotLines.concat(VerticalLine(first_low_water_90, "90 % Laag Water!", "warning"));
        }
        
        
    } else if (props.type === "forecasts") {
        
        if (props.showHistoricals) {
            series2display.push(Historical(series));
            minDate = series.filter((item:Forecast) => item.name == "Historical")[0].data[0][0];
        }
        series2display.push(LowWater(series));
    }
    let formattedSeries = series2display;


    if (props.type === "forecasts") {
        formattedSeries = [
            ...series2display,
            {
                name: `${series.length - 1} Models`,
                color: "black",
                showInLegend: true,
                marker: false,
                data: [],
                events: {
                    legendItemClick: function () {
                        return false;
                    },
                },
                area: {
                    animation: true
                },
            },
        ];
    }


    const options = {
        title: "",
        rangeSelector: {
            selected: 1
        },

        credits: { enabled: false },

        xAxis: {
            title: {
                text: "Tijd (dagen)",
                style: {
                    color: "black",
                    fontWeight: "bold"
                }
            },
            type: "datetime",
            min: minDate,
            max: maxDate,
            plotLines: plotLines
        },

        yAxis: {
            title: {
                text: `${varname} ${um ? "(" + um + ")" : ""}`,
                style: {
                    color: "black",
                    fontWeight: "bold"
                }
            },
            lineWidth: 1,
        },

        tooltip: {
            crosshairs: true,
            shared: props.type === "ensemble" ? true : false,
            valueDecimals: 2,
        },

        plotOptions: {
            series: {
                pointIntervalUnit: "day",
            }
        },

        legend: {
            enabled: true,
            layout: "horizontal",
            symbolWidth: 24,
            symbolHeight: 12,
            symbolRadius: 1,
        },

        chart: {
            zoomType: "x",
        },
        annotations: [{

            labels: [{
                point: {
                    x: 20, 
                    y: (series.filter((item:Forecast) => item.name == "Laag Water")[0].data).filter((item:[string, number]) => item[0] == minDate)[0][1] - 350, //y is the value of the first entry in LowWater that gets displayed - 400
                    yAxis: "0"
                },
                align: "down",
                text: `&#x2193; Laag Water &#x2193;`,
                backgroundColor: "rgba(255,255,255,0)",
                borderColor: "black",
                borderWidth: 0,
                style: {
                    color: "red",
                    fontSize: "0.75em"
                }
            }],
            draggable: "",
            useHTML: true
        }],

        series: formattedSeries,
    };
    return <HighchartsReact
        highcharts={Highcharts}
        options={options}
    />;
};

export default Ensemble;