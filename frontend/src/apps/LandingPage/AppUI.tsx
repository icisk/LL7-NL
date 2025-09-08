// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Button, Container, Text } from "@open-pioneer/chakra-integration";
import { METHODS } from "http";
import { useLayoutEffect, useState } from "react";

export function AppUI () {

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


    const [type, setType] = useState("Usergroup1");
    const [danger_level_water_flow, setDangerLevelWaterFlow] = useState("danger");  
    const [danger_level_map, setDangerLevelMap] = useState("low-danger");  


    const apiUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/" : "http://localhost:5000/";
    const imageUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/app/images/" : "http://localhost:5173/images/";

    const openWeekOverview = (type:String) => {
        window.open(`./sites/WeekOverview/index.html?test=${type}`, "_self");
    }
    return(
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
            <Container centerContent>
                <div style={{marginTop: "2vh"}}>
                    <Button className={`left-choice-button ${type === "Usergroup1" ? "" : "inactive"}`}  onClick={() => {setType("Usergroup1");}}>Recreatievaart</Button>
                    <Button className={`middle-choice-button ${type === "Usergroup2" ? "": "inactive" }`} onClick={() =>{setType("Usergroup2");}}>Landbouw</Button>
                    <Button className={`right-choice-button ${type === "Usergroup3" ? "" : "inactive"}`} onClick={() => {setType("Usergroup3");}}>Waterbeheer</Button>
                </div>
            </Container>
            <button style={{backgroundColor:"orange", color:"white", fontSize: "1.2rem"}}  className={`button-switch-size`} id="map" onClick={() => {openWeekOverview(type)}}>Droogtebeeld</button>
            <button style={{backgroundColor:"blue", color:"white" , fontSize: "1.2rem"}} className={`button-switch-size ${danger_level_water_flow}`} onClick={() => {window.open("./sites/Ensemble/", "_self");}}>Afvoer Lobith</button>
            <button style={{backgroundColor:"green", color:"white", fontSize: "1.2rem"}} className={`button-switch-size  ${danger_level_map}`} onClick={() => {window.open("./sites/Precipdeficit/", "_self");}}>Neerslagtekort</button>
            <button style={{backgroundColor:"#328fa8", color:"white", fontSize: "1.2rem"}} className={`button-switch-size  ${danger_level_map}`}>Klimaat</button>

        </>
    );
}