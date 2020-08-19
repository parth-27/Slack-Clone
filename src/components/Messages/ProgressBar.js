import React from 'react';
import { Progress } from "semantic-ui-react";

const ProgressBar = ({uploadState,percentUploaded}) => (
    
    // if uploadState is present then we will show progress bar
    uploadState === "uploading" && (
        <Progress
            className="progress__bar"
            percent={percentUploaded}
            progress
            indicating
            size="medium"
            inverted
        />
    )
);

export default ProgressBar
