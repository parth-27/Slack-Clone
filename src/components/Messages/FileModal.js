import React, { Component } from 'react';

import { Modal, Input, Button, Icon } from 'semantic-ui-react';

// for determining the file types.
import mime from 'mime-types';

export default class FileModal extends Component {

    state = {
        file: null,
        // allowed file types.
        authorized: ["image/jpeg", "image/png"]
    }

    // add the file which user selected to the state.
    addFile = event => {
        const file = event.target.files[0];
        
        // if file is selected then add to the state.
        if (file) {
            // used destructuring to set the file property in the state.
            this.setState({ file });
        }
    }


    // 
    sendFile = () => {
        const { file } = this.state;
        const { uploadFile,closeModal } = this.props;

        // if file is present
        if (file !== null) {

            // if the file type which user has selected is authorized or not.
            if (this.isAuthorized(file.name))
            {
                // if file is authorized then send the file    
                // using mime.lookup for putting the file in the meta data object.
                const metadata = { contentType: mime.lookup(file.name) }
                
                // this function is created in messageform.js
                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    }

    // check if the selected file is authorized or not.
    isAuthorized = (filename) => this.state.authorized.includes(mime.lookup(filename));


    // clearing the file and state.
    clearFile = () => this.setState({ file: null });

    render() {

        const { modal, closeModal } = this.props;

        return (
            <Modal
                basic
                open={modal}
                onClose={closeModal}
            >
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                        onChange={this.addFile}
                        fluid
                        label="File types:jpg, png"
                        name="file"
                        type="file"
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={this.sendFile}
                        color="green"
                        inverted
                    >
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button
                        color="red"
                        inverted
                        onClick={closeModal}
                    >
                        <Icon name="remove" /> Cancel
                    </Button>    
                </Modal.Actions>
            </Modal>
        )
    }
}
