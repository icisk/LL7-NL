// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@open-pioneer/chakra-integration";
import { ZoomHandler } from "../services/ZoomHandler";
import { useService } from "open-pioneer:react-hooks";



export function ZoomToButton() {
    const prepSrvc = useService<ZoomHandler>("app.ZoomHandler");

    return <Button style={{ marginLeft: "1em"}} onClick={() => prepSrvc.zoom_to_rijnland()}>Zoom to Rijnland</Button>;

}

export default ZoomToButton;