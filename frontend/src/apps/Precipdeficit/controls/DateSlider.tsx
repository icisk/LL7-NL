// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack} from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { LayerHandler } from "../services/LayerHandler";
import { useState, useEffect} from "react";
import { ContentPasteOffSharp } from "@mui/icons-material";

interface Props{
    isMobile:boolean
}

export function DateSlider(props:Props){
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");
    const [sliderValue, setSliderValue] = useState(0);
    const { currentDate } = useReactiveSnapshot(
        () => ({
            currentDate: prepSrvc.currentDate
        }),
        [prepSrvc]
    );


    useEffect(() => {
        // Reset slider value to 0 when props.children changes
        setDisplayDate(currentDate);
        setSliderValue(props.children.indexOf(currentDate));
    }, [props.children]); // Dependency on props.children
    const [displayDate, setDisplayDate] = useState(currentDate);

    function updateDate(val:number): void {
        prepSrvc.setDate(props.children?.[val] || "");

    }
    function onChange(val: number):void {
        setSliderValue(val);
        setDisplayDate(props.children?.[val] || "");

    }

    if (props.children === null) {
        return <div>Loading...</div>;  
    }

    return(
            <div style={{marginTop:"0.5em"}}>
                <VStack>
                    <Slider aria-label='slider-ex-1' value={sliderValue} onChange={(val) => (onChange(val))} onChangeEnd={(val) => (updateDate(val))} min={0} max={props.children.length - 1} width={"100%"} focusThumbOnChange={false} >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    {props.isMobile? 
                        <div> {displayDate} </div> :
                        <span style={{ marginLeft:"1em"}}> {displayDate} </span>
                    }
                </VStack>
            </div>
    );
}