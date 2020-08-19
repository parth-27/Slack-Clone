import React, { Component } from 'react';

// for croping the image
import AvatarEditor from "react-avatar-editor";

// styling our page
import { Grid, Header, Icon, Dropdown, Image,Modal, Input, Button } from 'semantic-ui-react';

// firbase for signning out the user.
import firebase from '../../firebase';

class UserPanel extends Component {

    state = {
        // getting the currentUser from the global state
        user: this.props.currentUser,
        modal: false,
        previewImage: "",
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        metadata: {
            contentType: 'image/jpeg'
        },
        uploadCroppedImage: '',
        usersRef: firebase.database().ref('users')
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    // function for drop down options
    // we are returning an array of objects from the function
    dropDownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span onClick={this.openModal} >Change Avatar</span>
        },
        {
            key: "signout",
            text: <span onClick={this.handleSignOut}>Sign Out</span>
        }
    ];

    // uploading cropped image to the firebase.
    uploadCroppedImage = () => {
        const { storageRef,userRef,blob,metadata } = this.state;
        storageRef
            .child(`avatars/user/${userRef.uid}`)
            .put(blob,metadata)     // putting image to the firebase
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    this.setState({ uploadCroppedImage: downloadURL }, () => {
                        this.changeAvatar();          
                    })
                })
            })
    }

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL:this.state.uploadCroppedImage
            })
            .then(() => {
                console.log("Avatar Updated");
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            })
        
        this.state.usersRef
            .child(this.state.user.uid)
            .update({ avatar: this.state.uploadCroppedImage })
            .then(() => {
                console.log("Avatar Updated");
            })
            .catch(err => {
                console.error(err);
            })
    }


    handleChange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener("load", () => {
                this.setState({ previewImage: reader.result });
            });
        }
    };

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                });
            });
        }
    };

    // signed out function.
    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log("Signed Out!!"));
    }

    render() {

        const { user,modal,previewImage,croppedImage } = this.state;

        return (
            <Grid style={{ background: '#4c3c4c' }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
                        {/* App Header.  
                            inverted is used for color of the header*/}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>
                                DevChat
                            </Header.Content>
                        </Header>
                        
                        {/* User DropDown */}
                        <Header style={{ padding: '0.25rem' }} as="h4" inverted>
                            <Dropdown
                                trigger={
                                    <span>
                                        <Image src={user.photoURL} spaced="right" avatar />
                                        {user.displayName}
                                    </span>
                                }
                                options={this.dropDownOptions()}
                            />
                        </Header>
                    </Grid.Row>
                    {/* change user avatar modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>
                            Change Avatar
                        </Modal.Header>
                        <Modal.Content>
                            {/* Preview image so user can crop it */}
                            <Input
                                onChange={this.handleChange}
                                fluid
                                type="file"
                                label="New Avatar"
                                name = "previewImage"
                            />

                            <Grid centered stackable columns={2}>
                                <Grid.Row centered >
                                    <Grid.Column className="ui centered aligned grid">
                                        {/* Image Preview */}
                                        {previewImage && (
                                            <AvatarEditor
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}  
                                    </Grid.Column>
                                    <Grid.Column>
                                        {/* Crop image preview */}
                                        {croppedImage && (
                                            <Image
                                                style={{ margin: '3.5em auto' }}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                <Icon name="save" /> Change Avatar
                            </Button>}
                            <Button color="green" inverted onClick={this.handleCropImage}>
                                <Icon name="image" /> Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" /> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}


export default UserPanel;