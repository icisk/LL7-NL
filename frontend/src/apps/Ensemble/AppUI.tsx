// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Button, Switch, Container, HStack, Spinner, Text } from "@open-pioneer/chakra-integration";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useState, useEffect, useLayoutEffect } from "react";
import Ensemble from "./lib/components/Ensemble";


export function AppUI() {

    const apiUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/" : "http://localhost:5000/";
    const imageUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/app/images/" : "http://localhost:5173/images/";



    const [riverData, setRiverData] = useState([]);
    const [historicalData, setHistoricalData] = useState([]);
    const [lowWaterData, setLowWaterData] = useState([]);
    const [type, setType] = useState("ensemble");
    const [plotType, setPlotType] = useState("forecast");
    const [loading, setLoading] = useState(true);
    const [showhistoricals, setShowHistoricals] = useState(false);
  
    // Handle to set historical toggle
    const handleShowHistoricals = (event: React.ChangeEvent<HTMLElement>) => {
        setShowHistoricals(event.target.checked);
    };
  
    //Get data from api endpoint
    useEffect(() => {
        fetch(`${apiUrl}api/lobith`)
            .then((res) => res.json())
            .then((response) => {
  
                const data = JSON.parse(response.data) || [];
                const historical_data = JSON.parse(response.historic) || [];
                const low_water_data = JSON.parse(response.low_water) || [];
  
                setRiverData(data);
                setHistoricalData(historical_data);
                setLowWaterData(low_water_data);
                setLoading(false);
  
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, [apiUrl]);
    //Reload solution when screen-size changes
    const [isMobile, setIsMobile] = useState(true);
    const [windowSize, setWindowSize] = useState([0,0]);
    const updateWindowSize = () => {
        if(window.innerWidth >= 600) {
            // setShowHistoricals(false);
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

    //Update historical toggle when mobile
    useEffect(() => {
        setShowHistoricals(isMobile);
    }, [isMobile]);
    if (loading) {
        return <>
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
            <Container mt={"3em"} centerContent width={window.innerWidth}>
                <Spinner size={"xl"}/> 

                <Text>{"Loading..."}</Text>
            </Container>
            </>    }

    //Create array structure with predictions
    const forecasts = [];
    if (riverData.length > 0) {
        for (let i = 0; i < riverData.length; i++) {
            forecasts.push({
                "name": "Model " + (i + 1),
                historical: false,
                "data": riverData[i]
            });
        }
        forecasts.push({
            "name": "Historical",
            historical: true,
            "data": historicalData
        });
        forecasts.push({
            "name": "Laag Water",
            lowWater: true,
            "data": lowWaterData
        });
    }
        
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
            <Button leftIcon={<ArrowBackIcon/>} onClick={() => {window.open("../../", "_self");}}>Menu</Button>
            <div className="header">Rijnafvoer te Lobith</div>
            {plotType == "forecast" ? 
                <>
                    <Container style={{marginBottom: "1em"}} centerContent>
                        <div>
                            <Button className={`left-choice-button ${plotType === "forecast" ? "" : "inactive"}`} onClick={() => {setPlotType("forecast");}}>Forecast</Button>
                            <Button className={`right-choice-button ${plotType === "projection" ? "" : "inactive  "}`} onClick={() => {setPlotType("projection");}}>Projection</Button>
                        </div>                    
                    </Container>    

                    {forecasts.length > 0 ? (
                        <Ensemble
                            key={`${type + windowSize[0] + windowSize[1]}`}
                            varname="Afvoer"
                            um="m&sup3;/s"
                            type={type}
                            series={forecasts}
                            showHistoricals={showhistoricals}
                        />
                    ) : (
                        <p>Forecast is not available..</p>
                    )}
                    <Container centerContent={isMobile}>    
                        <div>
                            <Button className={`left-choice-button ${type === "forecasts" ? "" : "inactive"}`} onClick={() => {setType("forecasts");}}>Single Runs</Button>
                            <Button className={`right-choice-button ${type === "ensemble" ? "" : "inactive  "}`} onClick={() => {setType("ensemble");}}>Ensemble</Button>
                            {!isMobile && <>                    
                                <span style={{marginLeft:"1em", marginRight:"1em"}} className="show-historicals">Show Historicals</span>
                                <Switch size="lg" onChange={handleShowHistoricals} defaultChecked={showhistoricals}></Switch>
                            </>}
                        </div>
                        {isMobile && 
                        <>
                            <HStack style={{marginTop:"0.5em"}}>
                                <span className="show-historicals">Show Historicals</span>
                                <Switch size="lg" onChange={handleShowHistoricals} defaultChecked={showhistoricals}></Switch>
                            </HStack>
                        </>}
                    </Container>
                </> : 
                <>
                    <Container style={{marginBottom: "1em"}} centerContent>
                        <div>
                            <Button className={`left-choice-button ${plotType === "forecast" ? "" : "inactive"}`} onClick={() => {setPlotType("forecast");}}>Forecast</Button>
                            <Button className={`right-choice-button ${plotType === "projection" ? "" : "inactive  "}`} onClick={() => {setPlotType("projection");}}>Projection</Button>
                        </div>                    
                    </Container>  
                </> 
            }
        </>
    );
}
