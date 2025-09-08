import { dark } from "@mui/material/styles/createPalette";

const usergroup1_text_present: Record<string, string> = {
    darkblue: "De situatie is normaal. Er kan optimaal geschut worden.", 
    blue: "De situatie is normaal. Er kan optimaal geschut worden.", 
    green:"De situatie is normaal. Er kan optimaal geschut worden.",
    yellow: "Er dreigt droogte. Er is mogelijk een aangepast schutregime.",
    orange: "Er is droogte. Er geldt een beperkt schutregime.",
    red: "Er is extreme droogte. De recreatievaart is volledig gestremd.", 
    darkred: "Er is extreme droogte. De recreatievaart is volledig gestremd."

}

const usergroup1_text_forecast: Record<string, string> = {
    darkblue: "De voorspelde situatie is normaal. Er kan optimaal geschut worden.", 
    blue: "De voorspelde situatie is normaal. Er kan optimaal geschut worden.", 
    green:"De voorspelde situatie is normaal. Er kan optimaal geschut worden.",
    yellow: "Er is meer dan 20% kans op dreigende droogte voorspeld. Er is mogelijk een aangepast schutregime.",
    orange: "Er is meer dan 20% kans op droogte voorspeld. Er geldt mogelijk een beperkt schutregime.",
    red: "Er is meer dan 20% kans op extreme droogte voorspeld. De recreatievaart is mogelijk volledig gestremd.", 
    darkred: "Er is meer dan 20% kans op extreme droogte voorspeld. De recreatievaart is mogelijk volledig gestremd."
}

const usergroup2_text_present: Record<string, string> = {
    blue:"green warinng text for usergroup 2",
    darkblue:"green warinng text for usergroup 2",
    green:"green warinng text for usergroup 2",
    yellow: "yellow warning text for usergroup 2",
    orange: "orange warning text for usergrup 2",
    red: "red warning text for usergroup 2",
    darkred:"red warning text for usergroup 2"

}

const usergroup2_text_forecast: Record<string, string> = {
    blue:"green warinng text for usergroup 2",
    darkblue:"green warinng text for usergroup 2",
    green:"green warinng text for usergroup 2",
    yellow: "yellow warning text for usergroup 2",
    orange: "orange warning text for usergrup 2",
    red: "red warning text for usergroup 2",
    darkred:"red warning text for usergroup 2"

}

const usergroup3_text_present: Record<string, string> = {
    blue:"green warinng text for usergroup 3",
    darkblue:"green warinng text for usergroup 3",
    green:"green warinng text for usergroup 3",
    yellow: "yellow warning text for usergroup 3",
    orange: "orange warning text for usergrup 3",
    red: "red warning text for usergroup 3",
    darkred: "darkred warning text for usergroup 3"
}


const usergroup3_text_forecast: Record<string, string> = {
    blue:"green warinng text for usergroup 3",
    darkblue:"green warinng text for usergroup 3",
    green:"green warinng text for usergroup 3",
    yellow: "yellow warning text for usergroup 3",
    orange: "orange warning text for usergrup 3",
    red: "red warning text for usergroup 3",
    darkred: "darkred warning text for usergroup 3"
}

const usergroup1_forecast_present: Record<string, Record<string, string>> = {
    present: usergroup1_text_present, 
    forecast: usergroup1_text_forecast
}

const usergroup2_forecast_present: Record<string, Record<string, string>> = {
    present: usergroup2_text_present, 
    forecast: usergroup2_text_forecast
}

const usergroup3_forecast_present: Record<string, Record<string, string>> = {
    present: usergroup3_text_present, 
    forecast: usergroup3_text_forecast
}


export const usergroup_text: Record<string, Record<string, Record<string, string>>> = {
    Usergroup1: usergroup1_forecast_present, 
    Usergroup2: usergroup2_forecast_present,
    Usergroup3: usergroup3_forecast_present,

};

