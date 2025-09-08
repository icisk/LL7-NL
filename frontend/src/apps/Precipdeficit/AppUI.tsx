// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Button, Box, Flex, Text } from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { DateSlider } from "./controls/DateSlider";
import { ZoomToButton } from "./controls/ZoomToButton";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { useState, useLayoutEffect, useEffect } from "react";
import { useMapModel } from "@open-pioneer/map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { Point } from "ol/geom";
import Ensemble from "./lib/Ensemble";
import {Legend} from "./components/Legend";
import { useService } from "open-pioneer:react-hooks";
import { useReactive, useReactiveSnapshot } from "@open-pioneer/reactivity";
import LayerSelector from "./controls/LayerSelector";

export function AppUI(){
    const imageUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/app/images/" : "http://localhost:5173/images/";

    const preSelected = location.search.split('date=')[1];
    const preSelected_date = preSelected == undefined ? undefined : new Date(Number(preSelected));     
    const MAP_ID = "Precip_deficit_map";

    const prepSrvc = useService<LayerHandler>("app.LayerHandler");

    const { lvls } = useReactiveSnapshot(
        () => ({
            lvls: prepSrvc.lvls
        }),
        [prepSrvc]
    );
    const { dates } = useReactiveSnapshot(
        () => ({
            dates: prepSrvc.dates
        }),
        [prepSrvc]
    );
    const currentDate: Date = new Date();
    type Coordinates = { x: number; y: number }; // Define the structure of your coordinate values

    const [clickedCoordinates, setClickedCoordinates] = useState<Record<string, Coordinates>>({});
    const [isMobile, setIsMobile] = useState(true);
    const [windowSize, setWindowSize] = useState([0,0]);
    const updateWindowSize = () => {
        if(window.innerWidth >= 600) {
            setIsMobile(false);
        }
        else
            setIsMobile(true);
        setWindowSize([window.innerWidth, window.innerHeight]);
    };
    useLayoutEffect(() => {
        window.addEventListener("resize", updateWindowSize);
        updateWindowSize();
        return () => window.removeEventListener("resize", updateWindowSize);
    },[]);

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
        source: markerSource,
        zIndex: 1
    });
    

    const markerStyle = new Style({
        image: new CircleStyle({
            radius: 6,  // Size of the marker
            fill: new Fill({ color: "red" }),  
            stroke: new Stroke({
                color: "black",  
                width: 2         
            })
        })
    });

    const mapState = useMapModel(MAP_ID);
    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.addLayer(markerLayer);
      
            return () => {
                olMap.removeLayer(markerLayer); // Cleanup on unmount
            };
        }
    }, [mapState]);

    const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
        setMarker(event.coordinate);
        
    };
    const setMarker = (coordinatesEPSG3857: number[]) => {
        let coordinatesEPSG28992 = transform(coordinatesEPSG3857, "EPSG:3857", "EPSG:28992");
        let coordinatesEPSG4326 =transform(coordinatesEPSG3857, "EPSG:3857", "EPSG:4326");

        

        coordinatesEPSG28992 = coordinatesEPSG28992?.map(function (x){
            return Math.round(x); 
        });

        setClickedCoordinates({
            "EPSG28992": { x: coordinatesEPSG28992[0], y: coordinatesEPSG28992[1] },
            "EPSG4326": { x: coordinatesEPSG4326[0], y: coordinatesEPSG4326[1] }
        });


        markerSource.clear();

        const marker = new Feature({
            geometry: new Point(coordinatesEPSG3857),
        });

        marker.setStyle(markerStyle);

        markerSource.addFeature(marker);
    }

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.on("click", handleMapClick);
            setMarker([509600, 6840000]);
            return () => {
                olMap.un("click", handleMapClick);
            };
        }
    }, [mapState]);

    return (
        <>
            <div style={{
                  position:"fixed",
                  bottom:"20px",
                  left:"20px",
                  width: isMobile? "150px" : "200px",
                  height:"auto"
            }}>
                    <img
                    src={`${imageUrl}/I-Cisk_logo.png`} // Replace with your logo path
                    alt="Logo"
                    className="logo"
                    onClick={() => window.open("https://icisk.eu/", "_blank", "noopener,noreferrer")}

                    />
            </div> 
            <div style={{
                position:"fixed",
                bottom:"20px",
                right:"20px",
                width:"100px",
                height:"auto"
            }}>
                <Text fontWeight={"bold"}>Beta Version</Text>
            </div>
            <div style={{height:"49vh"}}>
                <Box height="100%" overflow={"hidden"}>
                    <MapContainer mapId={MAP_ID} role="main">
                        {isMobile? <></> : <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        </MapAnchor>}
                        <MapAnchor position="bottom-left" horizontalGap={10} verticalGap={10}>
                            <Legend isMobile={isMobile}>{lvls}</Legend>
                        </MapAnchor>
                        <MapAnchor position={!isMobile ? "top-left": "top-left"} horizontalGap={10} verticalGap={10}>
                            <div style={{marginTop: isMobile ? "50px" : "", marginLeft: !isMobile ? "20%" : "0%", marginRight:!isMobile ? "20%" : "0%", borderRadius:"10px", backgroundColor:"rgba(255, 255, 255, 0.5)"}}>
                                <Flex role="top-left" direction="row" gap={10} padding={1}>
                                    <div style={{width:window.innerWidth}}>
                                        <DateSlider isMobile>{dates}</DateSlider>
                                    </div>
                                </Flex>
                            </div>
                        </MapAnchor>
                        <MapAnchor position="top-left" horizontalGap={10} verticalGap={10}>
                            <Button leftIcon={<ArrowBackIcon/>} onClick={() => {window.open("../../", "_self");}}>Menu</Button>
                        </MapAnchor>
                        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={10}>
                            <ZoomToButton></ZoomToButton>
                        </MapAnchor>
                        <MapAnchor position="top-right" horizontalGap={10} verticalGap={10}>
                            <Button style={{marginRight: "1em"}}>Projection</Button> 
                            <LayerSelector preSelected={preSelected_date}/>
                        </MapAnchor>

                    </MapContainer>
                </Box>
                
            </div>

            <Ensemble coords={clickedCoordinates}/>
             

        </>
    );
}
export default AppUI;
