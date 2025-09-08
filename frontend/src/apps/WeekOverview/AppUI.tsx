// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ConstructionOutlined, FestivalRounded } from "@mui/icons-material";
import { ChevronDownIcon, ChevronUpIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Container, Spinner, Text } from "@open-pioneer/chakra-integration";
import { usergroup_text  } from "./utils/usergroup_text";

import { useEffect, useLayoutEffect, useState } from "react";

export function AppUI () {
    const imageUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/app/rijnland--nl/images/" : "http://localhost:5173/images/";


    const color_lvls = {
        "darkblue": 2, 
        "blue": 2, 
        "green" : 2, 
        "yellow": 3, 
        "orange": 4, 
        "red": 5, 
        "darkred": 6
    }

    const colors = ["darkblue", "blue", "green", "yellow", "orange", "red", "darkred"]; 
    const colors_rgba = ["rgba(34, 34, 163, 0.8)", "rgba(101, 101, 219, 0.8)", "rgba(15, 133, 30, 0.8)", "rgba(201, 198, 24, 0.8)", "rgba(232, 149, 5, 0.8)", "rgba(209, 43, 2, 0.8)", "rgba(163, 21, 5, 0.8)"];
   
    const getWeekNumber = (d: Date): number => {    
        // Copy date so don't modify original
        const currentDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        currentDate.setUTCDate(currentDate.getUTCDate() + 4 - (currentDate.getUTCDay()||7));
        // Get first day of year
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (currentDate - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return  weekNo;
    }
    const [type, setType] = useState();
    const currentWeekNumber = getWeekNumber(new Date())

    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const addDays = (date: Date, days:number): Date => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }
    const [loading, setLoading] = useState(true);
    const [dangerLevels, setDangerLevels] = useState({});
    const [preipcDanger, setPrecipDanger] = useState({})
    const [selectedWeek, selectWeek] = useState(null);
    // const apiUrl = import.meta.env.PROD ? "https://i-cisk.dev.52north.org/living-labs/rijnland--nl/" : "http://localhost:5000/";
    const apiUrl ="https://i-cisk.dev.52north.org/living-labs/rijnland--nl/"
    const precipLvlsUrl = "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/netherlands/danger_levels.json"

    useEffect(() => {
        setType(location.search.split('test=')[1]);
        fetch(`${apiUrl}api/danger_levels`)
                .then((res) => res.json())
            .then((response) => {
                setLoading(false);
                setDangerLevels(response);
                
            });
        
    }, []);
    
    useEffect(() => {
        setType(location.search.split('test=')[1]);
        fetch(precipLvlsUrl)
            .then((res) => res.json())
            .then((response) => {
                setLoading(false);
                setPrecipDanger(response);

            });
        dangerLevels.precip_def = preipcDanger
        
        console.log(dangerLevels)
    }, [dangerLevels]);
    
  
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

    if (loading) {
        return <>
                    <div style={{
                  position:"fixed",
                  bottom:"20px",
                  left:"20px",
                  width:isMobile? "150px": "200px",
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
            </>
    }

    let weekData = []

    const calculate_color = (weekNr:Number[]) => {
        let worstWeek = 0; 
        for(let i = 0; i <= weekNr[1] - weekNr[0]; i++){
            worstWeek = Math.max(worstWeek, color_lvls[dangerLevels.lobith_lvls[weekNr[0] + i].toLowerCase()] , color_lvls[dangerLevels.precipd_def[weekNr[0] + i].toLowerCase()])
        }
        return colors[worstWeek];
    }
    const transform_color_to_rgba = (color:string) => {
        return colors_rgba[color_lvls[color]]; 
    }

    const startOfWeek = new Date(); // Clone the current date
    startOfWeek.setDate(startOfWeek.getDate() -  startOfWeek.getDay()  +1);
    for(let i = 0; i < 4; i++){

        weekData[i] = {
            label: `${formatDate(addDays(startOfWeek, i * 7))} - ${formatDate(addDays(startOfWeek, i * 7 + 6))} | ${currentWeekNumber + i} `,
            startDate: addDays(startOfWeek, i * 7).getTime(),
            weekNrStart: currentWeekNumber + i,
            weekNrEnd: currentWeekNumber + i
        }
    }
    for(let i = 0; i < 3; i++){

        weekData[i + 4] = {
            label: `${formatDate(addDays(startOfWeek, (i + 1) * 28))} - ${formatDate(addDays(startOfWeek, (i + 1) * 28 + 27))} | ${currentWeekNumber + 4 + (i * 4)} - ${currentWeekNumber + 3 + ((i + 1) * 4)}`,
            startDate: addDays(startOfWeek, (i + 1) * 28).getTime(),
            weekNrStart: currentWeekNumber + 4 + (i * 4),
            weekNrEnd: currentWeekNumber + 3 + ((i + 1) * 4)
        }
    }
    const generateWeekText = (date:string, color:string, time:string) => {
        return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{ usergroup_text[type][time][color] }</span>
            <a href="../Ensemble/" target="_self" rel="noopener noreferrer">Ensemble</a>
            <a href={`../Precipdeficit/index.html?date=${date}`} target="_self" rel="noopener noreferrer">Map</a>
        </div>)
    
    }
    
    const weeks = [];
    for(let i = 0; i <  7; i++){
        const onClickFunc = () => {
            if (selectedWeek == i) selectWeek(null);
            else selectWeek(i);};
        const color = calculate_color([weekData[i]?.weekNrStart,weekData[i]?.weekNrEnd]);
        const time = i == 0 ? "present" : "forecast"; 
        const week = 
        <div className="week-panel" onClick={onClickFunc}>
            <span id={`week-${i} `} className={`week-button ${dangerLevels[i]}`} style={{color:"white", background: `${transform_color_to_rgba(color)}`}}>
                {weekData[i].label}
                {selectedWeek==i ? <ChevronUpIcon w={8} h={8} style={{float:"right"}}/> : <ChevronDownIcon w={8} h={8} style={{float:"right"}}/>}
            </span>
            <div className={`danger-panel ${dangerLevels[i]}`} style={{ display: selectedWeek === i ? "block" : "none", background: `${transform_color_to_rgba(color)}`, color: "white"}}>{generateWeekText(weekData[i]?.startDate, color, time)}</div>
        </div>;
        weeks.push(week);

    };
    return (
        <>              
            <div style={{
                  position:"fixed",
                  bottom:"20px",
                  left:"20px",
                  width: !isMobile ? "200px": "150px",
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
        {!isMobile ? 
        <span style={{ display: "flex"}}>      
            <Button leftIcon={<ArrowBackIcon/>} style={{marginBottom: "10px"}} onClick={() => {window.open("../../", "_self");}}>Menu</Button>
            <Container centerContent position={"absolute"} left={"50%"} width={"100%"} style={{transform: "translateX(-50%)"}} /* Centers it in the screen */
            >
                <span>
                    <Button className={`left-choice-button ${type === "Usergroup1" ? "" : "inactive"}`} onClick={() => {setType("Usergroup1");}}>Recreatievaart</Button>
                    <Button className={`middle-choice-button ${type === "Usergroup2" ? "": "inactive" }`} onClick={() =>{setType("Usergroup2");}}>Landbouw</Button>
                    <Button className={`right-choice-button ${type === "Usergroup3" ? "" : "inactive"}`} onClick={() => {setType("Usergroup3");}}>Waterbeheer</Button>
                </span>
            </Container>
        </span> : 
        <>
            <Button leftIcon={<ArrowBackIcon/>} style={{marginBottom: "10px"}} onClick={() => {window.open("../../", "_self");}}>Menu</Button>
            <Container centerContent /* Centers it in the screen */
            >
                <span>
                    <Button className={`left-choice-button ${type === "Usergroup1" ? "" : "inactive"}`} onClick={() => {setType("Usergroup1");}} >Recreatievaart</Button>
                    <Button className={`middle-choice-button ${type === "Usergroup2" ? "": "inactive" }`} onClick={() =>{setType("Usergroup2");}}>Landbouw</Button>
                    <Button className={`right-choice-button ${type === "Usergroup3" ? "" : "inactive"}`} onClick={() => {setType("Usergroup3");}}>Waterbeheer</Button>
                </span>
            </Container>
        </>
        }
            {weeks}
        </>
    );
}
