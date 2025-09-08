// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Fill, Style } from "ol/style.js";


export const GeoJsonLayer_Raster = (values, lats, lons) => {
    let features = [];
    for(let x = 0; x < lons.length; x++){
        for(let y = 0; y < lats.length; y++){
            if(values[y][x] >= 0){
                features.push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [lons[x]-0.5, lats[y]-0.5],
                            [lons[x]-0.5, lats[y]+0.5],
                            [lons[x]+0.5, lats[y]+0.5],
                            [lons[x]+0.5, lats[y]-0.5],
                            [lons[x]-0.5, lats[y]-0.5]
                        ]
                        ]
                    },
                    "properties": {
                        "value": values[y][x]
                    }
                }
                );
            }
        }
    }
    let layer = {
        "type": "FeatureCollection",
        "features": features
    };
    return layer;
};
export const styleFunction = (feature, maxVal) => {
    let value = 1 - Math.exp(-feature.getProperties().value/  maxVal);
    let r = (255 - 255  * value).toString();
    let g = (252 - 252  * value).toString();
    let b  =(172 + 83 * value).toString();
    let colorString = "rgba(".concat(r, ",",g,",",b,",0.75)");
    return  new Style({
        fill: new Fill({
            color: colorString
        })
    });
    // return new Style({
    //     image: new Circle({
    //         radius: 7,
    //         fill: new Fill({ color: "blue" }),
    //         stroke: new Stroke({
    //             color: "black", width: 2,
    //         }),
    //     }),
    // });
};

export const GeoJsonLayer2 = (data) => {
    let features = [];
    for(let i = 0; i < data.length; i ++){
        for(let j = 0; j < data[i].length; j++){
            features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        data[i][j][1], data[i][j][0]
                    
                    ]
                },
                "properties": {
                    "value": data[i][j][2]
                }
            }
            );
        }
    }
    let layer = {
        "type": "FeatureCollection",
        "features": features
    };
    // let layer = {
    //     "type": "FeatureCollection",
    //     "features":[{
    //         "type": "Feature",
    //         "geometry": {
    //             "type": "Polygon",
    //             "coordinates": [
    //                 [
    //                     [10, 10],
    //                     [-10, 10],
    //                     [-10, -10],
    //                     [10, -10],
    //                     [10,10]
    //                 ],
    //             ],
    //         },
    //     }]
    // };
    return layer;
};

export const GeoJsonLayer = (features) => {
    let layer = {
        "type": "FeatureCollection",
        "features": features
    };
    return layer;
};