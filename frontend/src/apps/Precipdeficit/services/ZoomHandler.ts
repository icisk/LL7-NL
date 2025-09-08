// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { MapRegistry } from "@open-pioneer/map";
import { extend } from "ol/extent";
// import { Center } from "@chakra-ui/react";

interface References {
    mapRegistry: MapRegistry;
}

export interface ZoomHandler extends DeclaredService<"app.ZoomHandler">
    {
        zoom_to_rijnland(): void
    }

export class ZoomHandlerImpl implements ZoomHandler{
    private MAP_ID = "Precip_deficit_map";
    private mapRegistry: MapRegistry;

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

    }
    zoom_to_rijnland(): void {
        this.mapRegistry.getMapModel(this.MAP_ID).then((model) => {
            // model?.olMap.getView().animate(
            //     center: {x: 0, y: 0},
            // )    
            const view = model?.olMap.getView();
            const rijnland_layer = model?.layers.getLayerById("rijnland_area");
            //@ts-expect-error random error
            const extent  =rijnland_layer?.olLayer.getSource().getFeatures()[0].getGeometry().getExtent();
            view?.fit(extent,{padding: [50,50,50,50], duration: 1000 });
        });
    }
}