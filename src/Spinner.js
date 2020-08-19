import React from 'react'

import { Loader, Dimmer } from "semantic-ui-react";

// displaying to our user when the screen is blank.
export default function Spinner() {
    return (
        <Dimmer active>
            <Loader size="huge" content={"Preparing Chat ..."} />
        </Dimmer>
    )
}
