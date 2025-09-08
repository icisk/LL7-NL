import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import Accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { Spinner, Container, Text } from "@open-pioneer/chakra-integration";

interface Props {
    coords: number[];
}

HighchartsMore(Highcharts);
Accessibility(Highcharts);


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

const Ensemble = (props: Props) => {
    const [options, setOptions] = useState(null);
    const [loading,  setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        if(JSON.stringify(props.coords.EPSG4326) == undefined)return;  
        const historic_url = `https://i-cisk.dev.52north.org/data/collections/knmi_evapo_obs_2024/position?coords=POINT(${props.coords.EPSG28992.x} ${props.coords.EPSG28992.y})&f=json`
        const forecast_url =  `https://i-cisk.dev.52north.org/data/collections/knmi_evapo_obs_forecast_2025/position?coords=POINT(${props.coords.EPSG4326.x} ${props.coords.EPSG4326.y})&f=json`

        Promise.all([fetch(historic_url).then(res => res.json()), fetch(forecast_url).then(res => res.json())])
            .then(([historic_data, forecast_data]) => {
                const dates = [];
                const currentDate = new Date(historic_data.domain.axes.time.start);
                for (let i = 0; i < historic_data.domain.axes.time.num; i++) {
                    dates.push(currentDate.toISOString().split("T")[0]);
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                const today = new Date();
                const todayTime = new Date(today.getFullYear().toString() + "/" +  (today.getMonth() + 1).toString() + "/" + today.getDate()).getTime();

                const values_historic = historic_data.ranges.p_def.values;
                const values_20 = forecast_data.ranges.p_def_q20.values;
                const values_50 = forecast_data.ranges.p_def_q50.values;
                const values_80 = forecast_data.ranges.p_def_q80.values;

                const start_historic = new Date(historic_data.domain.axes.time.start).getTime();
                const stop_historic = new Date(historic_data.domain.axes.time.stop).getTime();
                const num_historic = historic_data.domain.axes.time.num;

                const start_forecast = new Date(forecast_data.domain.axes.time.start).getTime(); 
                const stop_forecast = new Date(forecast_data.domain.axes.time.stop).getTime();
                const num_forecast = forecast_data.domain.axes.time.num; // Number of intervals
                
                const step_forecast = (stop_forecast - start_forecast) / (num_forecast - 1); // Step size in milliseconds
                const step_historic = (stop_historic - start_historic) / (num_historic - 1);

                
                const unixTimeArray_forecast = Array.from({ length: num_forecast }, (_, i) => Math.round(start_forecast + i * step_forecast));
                const unixTimeArray_historic = Array.from({ length: num_historic }, (_, i) => Math.round(start_historic + i * step_historic));

                const data_historic = unixTimeArray_historic.map((_, i ) => [unixTimeArray_historic[i], values_historic[i]]);
                const data_20_80 = unixTimeArray_forecast.map((_, i) => [unixTimeArray_forecast[i], values_20[i], values_80[i]]);
                const data_50 = unixTimeArray_forecast.map((_, i ) => [unixTimeArray_forecast[i], values_50[i]]);
                
                const series_20_80 = {
                    name: `20th-80th Percentile forc.`,
                    data: data_20_80,
                    type: "areasplinerange",
                    color: "#2caffe",
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
                };

                const series_50= {
                    name: `mean forc.`,
                    data: data_50,
                    type: "spline",
                    color: "#2caffe",
                    lineWidth: 2,
                    zIndex: 0,
                    marker: {
                        enabled: false,
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                };

                const series_historic= {
                    name: `historic data.`,
                    data: data_historic,
                    type: "spline",
                    color: "#6b8abc",
                    lineWidth: 2,
                    zIndex: 0,
                    marker: {
                        enabled: false,
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                };


                const seriesToDisplay = [series_20_80, series_50, series_historic];
                const plotLines = VerticalLine(todayTime, "Today", "info");

                setOptions({
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
                            min: start_historic,
                            max: stop_forecast,
                            plotLines: plotLines
                        },
                
                        yAxis: {
                            title: {
                                text: "Precip Deficit in mm",
                                style: {
                                    color: "black",
                                    fontWeight: "bold"
                                }
                            },
                            lineWidth: 1,
                            plotLines: [
                                {
                                  color: "red", 
                                  value: 200,  
                                  width: 2,     
                                  dashStyle: "Dash",
                                  label: {
                                    text: "", 
                                    align: "right",
                                    style: {
                                      color: "red",
                                      fontWeight: "bold",
                                    },
                                  },
                                },
                                {
                                    color: "orange", 
                                    value: 150,   
                                    width: 2,     
                                    dashStyle: "Dash", 
                                    label: {
                                      text: "", 
                                      align: "right",
                                      style: {
                                        color: "red",
                                        fontWeight: "bold",
                                      },
                                    },
                                  },
                              ],
                        },
                
                        tooltip: {
                            crosshairs: true,
                            shared:  true,
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
                            verticalAlign: "top",
                            symbolWidth: 24,
                            symbolHeight: 12,
                            symbolRadius: 1,
                        },
                
                        chart: {
                            zoomType: "x",
                        },
                        series: seriesToDisplay 
            })
            setLoading(false);
        })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });

    }, [props.coords]);

    if (loading) {
        return <>
            <Container mt={"3em"} centerContent width={window.innerWidth}>
                <Spinner size={"xl"}/> 

                <Text>{"Loading..."}</Text>
            </Container>
            </>
    }

    return options ? <HighchartsReact highcharts={Highcharts} options={options} /> : null;
};

export default Ensemble;
