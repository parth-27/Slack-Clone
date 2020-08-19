import React, { Component } from "react";

import { Segment, Input, Button } from "semantic-ui-react";

import firebase from "../../firebase";

import FileModal from "./FileModal";

// to create a random string in file upload.
import { v4 as uuid } from "uuid";

import ProgressBar from './ProgressBar';

// emoji picker
import { Picker, emojiIndex } from 'emoji-mart';   

import 'emoji-mart/css/emoji-mart.css';

export default class MessageForm extends Component {
    state = {
        percentUploaded: 0,
        uploadState: "",
        uploadTask: null,
        storageRef: firebase.storage().ref(), // for storing the image in the firebase database.
        message: "",
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        // modal for file and document uploading
        modal: false,
        typingRef: firebase.database().ref('typing'),
        emojiPicker : false
    };

    componentWillUnmount() {
        // cancel the upload when component is unmounting.
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask: null });
        }
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    // handleChange will update the message.
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    // TODO : typping effect
    handleKeyDown = (event) => {
        
        if (event.keyCode === 13) {
            this.sendMessage();
        }

        const { message, typingRef, channel, user } = this.state;

        if (message) {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName);
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove();
        }
    };


    // emoji picker
    handleTogglePicker = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker });
    }

    handleAddEmoji = (emoji) => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons} `);
        this.setState({ message: newMessage, emojiPicker: false });
        setTimeout(() => this.messageInputRef.focus(), 0);
    }

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };


    // creating message
    createMessage = (fileUrl = null) => {
        const message = {
            // timestamp so we know when the message was created
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL,
            },
        };

        // message with file url
        if (fileUrl != null) {
            message["image"] = fileUrl;
        }
        // if normal message.
        else {
            message["content"] = this.state.message;
        }

        return message;
    };

    //for message sending
    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel } = this.state;

        // if message is present
        if (message) {
            this.setState({ loading: true });

            // from which channel we are getting the message to.
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: "", errors: [] });
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err),
                    });
                });
        } else {
            this.setState({
                errors: this.state.errors.concat({ message: "Add a message" }),
            });
        }
    };

    // getting path for uploading a file differently when private and public channel
    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.state.channel.id}`;
        }
        return 'chat/public';
    }

    // uploading the file
    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuid()}.jpg`;

        this.setState(
            {
                uploadState: "uploading",
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
            },
            () => {
                // listening for state change
                this.state.uploadTask.on(
                    "state_changed",
                    (snap) => {
                        const percentUploaded = Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        );

                        // so we can track how much of the file is uploaded.
                        this.setState({ percentUploaded });
                    },
                    (err) => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null,
                        });
                    },
                    () => {
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then((downloadUrl) => {
                                this.sendFileMessage(downloadUrl, ref, pathToUpload);
                            })
                            .catch((err) => {
                                console.error(err);
                                this.setState({
                                    errors: this.state.errors.concat(err),
                                    uploadState: "error",
                                    uploadTask: null,
                                });
                            });
                    }
                );
            }
        );
    };

    // senfile message
    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref
            .child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: "done" });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                });
            });
    };

    render() {
        const { errors, message, loading, modal,percentUploaded,uploadState,emojiPicker } = this.state;
        // giving message to the value wiill clear the message from the prompt.
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker
                        set="apple"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="pick your emoji"
                        emoji="point_up"
                    />
                )}
                <Input
                    fluid
                    name="message"
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}  //for typing effect in the chat window
                    value={message}
                    ref={node => (this.messageInputRef = node)}
                    style={{ marginBottom: "0.7em" }}
                    label={<Button
                        onClick={this.handleTogglePicker} 
                        icon={emojiPicker ? "close" : "add"}
                        content={emojiPicker ? "Close" : null}    
                    />}
                    labelPosition="left"
                    className={
                        errors.some((error) => error.message.includes("message"))
                            ? "error"
                            : ""
                    }
                    placeholder="Write Your Message"
                />

                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        disabled={loading}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />

                    <Button
                        color="teal"
                        disabled={uploadState==="uploading"}
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />

                </Button.Group>
                {/* Displaying our modal */}
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar 
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        );
    }
}
