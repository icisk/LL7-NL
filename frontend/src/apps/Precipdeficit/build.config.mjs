// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "app.css",
    i18n: ["en"],
    ui: {
        references: ["app.LayerHandler", "app.ZoomHandler"],
    },
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        LayerHandlerImpl:{
            provides: ["app.LayerHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        ZoomHandlerImpl:{
            provides: ["app.ZoomHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        }
    }
});
