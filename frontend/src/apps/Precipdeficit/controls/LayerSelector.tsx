// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button} from "@open-pioneer/chakra-integration";
import { LayerHandler } from "../services/LayerHandler";
import { useService } from "open-pioneer:react-hooks";
import { useState} from "react";

// interface Props {
//     setYear: (value: number) => void;
//   }
interface Props{
    preSelected:Date
}

export function LayerSelector(props:Props) {
    const currentDate: Date = new Date();

    const currentYear: number = currentDate.getFullYear(); 
    const [selectedYear, setSelectedYear] = useState(props.preSelected == undefined ? (currentYear - 1) : props.preSelected.getFullYear());
    const prepSrvc = useService<LayerHandler>("app.LayerHandler");



    function setYear(val:number): void {
        setSelectedYear(val);
        prepSrvc.setYear(val);
    }




    return  <>
        <Button className={`left-choice-button ${selectedYear == currentYear - 1  ? "" : "inactive"}`} onClick={() => {setYear(currentYear - 1);}}>{currentYear - 1}</Button>
        <Button className={`right-choice-button ${selectedYear == currentYear ? "" : "inactive  "}`} onClick={() => {setYear(currentYear);}}>{currentYear}</Button>
    </>

}

export default LayerSelector;