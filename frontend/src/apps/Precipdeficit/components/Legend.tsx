// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from "@open-pioneer/chakra-integration";
import { isMapIterator } from "util/types";

export const Legend = (props:Boolean) => {

    const to_display = [
        {label: "0 - 50", color: "rgba(34, 34, 163, 0.7)"},
        {label: "50 - 99", color: "rgba(101, 101, 219, 0.7)"},
        {label: "100 - 124", color: "rgba(15, 133, 30, 0.7)"},
        {label: "125 - 149", color: "rgba(201, 198, 24, 0.7)"},
        {label: "150 - 174", color: "rgba(232, 149, 5, 0.7)"},
        {label: "175 - 200", color: "rgba(209, 43, 2, 0.7)"},
        {label: ">200", color: "rgba(163, 21, 5, 0.7)"}
    ]
    return (
        <Box bg={props.isMobile ?  "rgba(255,255,255, 0.5)" : "white"} p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={0}>{"Precip deficit in mm"}</Text>
            <Text mb={0}>{"50th - percentile"}</Text>
            {to_display.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
            
        </Box>
    );
};