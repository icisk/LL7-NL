// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import {Vector as VectorLayer} from "ol/layer.js";
import {Vector as VectorSource} from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { MAP_ID } from "./MapProvider";
import { Feature } from "ol";
import { Fill, Stroke, Style, Text} from "ol/style";
import { GeoJsonLayer } from "../lib/layer";
import { ReactText } from "react";




interface References {
    mapRegistry: MapRegistry;
}

interface legendItem {
        color: string;
        label: string;
}

export interface LayerHandler
    extends DeclaredService<"app.LayerHandler"> {
    currentDate: string;
    setDate(date: string): void;
    dates: string[];
    selectedYear: number;
    setYear(newYear: number): void; 
}


export class LayerHandlerImpl implements LayerHandler {

    private MAP_ID = "Precip_deficit_map";

    private apiUrl:string = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/" : "http://localhost:5000/";

    private maximallvls = [50, 100, 125 ,150 , 175, 200, 4294967295];
    private today = new Date(); 
    private currentYear = this.today.getFullYear();
    private mapRegistry: MapRegistry;
    private layer: VectorLayer<Feature> | undefined;
    private lvls_minvalues: number[];
    #dates: Reactive<string[]> = reactive (this.getDates(this.currentYear - 1));
    #lvls: Reactive<legendItem[]> = reactive([]); 

    #currentDate: Reactive<string> = reactive(`${this.currentYear - 1}-04-01`);
    #selectedYear: Reactive<number> = reactive(this.currentYear - 1);


    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;
        this.mapRegistry.getMapModel(MAP_ID).then((model) => {

            const getText = (feature) => {
                return(String(feature.values_.lvlmin));
            }
            const getColor = (feature) => {
                return ["rgba(34, 34, 163, 0.7)", "rgba(101, 101, 219, 0.7)", "rgba(15, 133, 30, 0.7)", "rgba(201, 198, 24, 0.7)", "rgba(232, 149, 5, 0.7   )", "rgba(209, 43, 2, 0.7)", "rgba(163, 21, 5, 0.7)"][this.maximallvls.findIndex((item) => item === feature.values_.lvlmax)];
            };
            
            this.layer = new VectorLayer({
                source: this.createSource(),
                style: function (feature) {
                    return new Style({
                        fill: new Fill({
                            color: getColor(feature),
                        }),
                        text: new Text({
                            text: getText(feature),
                            font: "15px Arial",
                            stroke: new Stroke({color: "white", width: 5}),
                            placement: "line"
                        })

                    });
                },
            });
            
            model?.layers.addLayer(
                new SimpleLayer({
                    title: "Precipitation Forecast",
                    olLayer: this.layer
                })
            );

            const rijnland_layer: VectorLayer<Feature> = new VectorLayer({
                source: new VectorSource({
                    url: `${this.apiUrl}api/rijnland`,
                    format: new GeoJSON({
                        dataProjection: "EPSG:3857",  
                        featureProjection: "EPSG:3857"
                    }),
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: "black",
                        width: 2,
                    }),
                }),
            });
            model?.layers.addLayer(
                new SimpleLayer({
                    id: "rijnland_area",
                    title: "rijnland_area",
                    olLayer: rijnland_layer
                })
            );
        });
    }
    get lvls(): number[] {
        return this.#lvls.value;
    }

    get currentDate(): string {
        return this.#currentDate.value;
    }
    get dates(): string[] {
        return this.#dates.value;
    }

    setYear(newYear: number): void {

        this.#dates.value = this.getDates(newYear);

        this.#currentDate.value = this.#dates.value[0];
        this.#selectedYear.value = newYear;
        const vectorSource = this.createSource();   
    }

    private getDates(year:number):string[] {
        const currentDate = new Date(); // Get today's date
        currentDate.setDate(currentDate.getDate() + 90);

        const mm = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(currentDate.getDate()).padStart(2, '0');

        const startingDate = new Date().getFullYear() == year ? "01-01" : "04-01"; 
        const endDate = new Date().getFullYear() == year ? `${mm}-${dd}` : "12-31";
        return this.getDatesBetween(new Date(`${year}-${startingDate}`), new Date(`${year}-${endDate}`));
 
    }

    private getDatesBetween(startDate:Date, endDate:Date):string[] {
        const dates:string[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const formattedDate = currentDate.toISOString().split("T")[0] || "";
            dates.push(formattedDate);
    
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }
    
    


    setDate(date: string): void {
        this.#currentDate.value = date;
        this.createSource();   
    }

    private createSource() {
        let url = `https://i-cisk.dev.52north.org/data/collections/knmi_evapo_obs/items?f=json&date=${this.#currentDate.value}T00%3A00%3A00&limit=30`;
        if(new Date(this.#currentDate.value) >= new Date()) {
            url = `https://i-cisk.dev.52north.org/data/collections/knmi_evapo_obs_forecast/items?f=json&date=${this.#currentDate.value}T00%3A00%3A00&limit=30`
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const geojsonObject = GeoJsonLayer(data.features);
                this.lvls_minvalues = [...new Set(geojsonObject.features.map((item) => {return(parseFloat(item.properties.lvlmin));}))].sort((a,b) => a - b);
                const lvls_maxvalues = [...new Set(geojsonObject.features.map((item) => {return(parseFloat(item.properties.lvlmax));}))].sort((a,b) => a - b);
                const colors = ["#eb7fe9BC","#4f59cdBC","#1ceae1BC","#5fdf65BC","#eade57BC", "#ec8647BC", "#832525BC", "#53050aBC", "darkred", "darkred", "darkred", "darkred", "darkred", "darkred", "darkred", "darkred"].slice(0, this.lvls_minvalues.length);
                
                
                this.#lvls.value = this.lvls_minvalues.map((value, index) => ({
                    label: `${value} - ${lvls_maxvalues[index]}`,
                    color: colors[index]
                }));             


                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(geojsonObject, {
                        featureProjection: "EPSG:3857"

                    })
                });
                this.layer?.setSource(vectorSource);
            })

            .catch(error => console.error("Error:", error));
    
    }
}
