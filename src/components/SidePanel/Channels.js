import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import firebase from '../../firebase';

import { connect } from 'react-redux';

import { setCurrentChannel,setPrivateChannel } from '../../actions';

class Channels extends Component {

    state = {
        user: this.props.currentUser,
        channel:null,
        channels: [],
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        notifications:[],
        modal: false,
        firstLoad: true,
        activChannel:''
    };

    componentWillUnmount() {
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.channelsRef.off();
        this.state.channels.forEach(channel => {
            this.state.messagesRef.child(channel.id).off();
        })
    };


    // placing the information about the selected channel on the global sate.
    changeChannel = channel => {
        // display the user which channel is selected
        this.setActiveChannel(channel);


        // clear the notificaions
        this.clearNotifications();


        this.props.setCurrentChannel(channel);

        // changing our private channel to public channel
        this.props.setPrivateChannel(false);

        this.setState({ channel });
    };

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)

        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];

            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;

            this.setState({ notifications: updatedNotifications });
        }
    }

    setActiveChannel = (channel) => {

        this.setState({ activChannel: channel.id });
    }


    // getting all the channel data and displaying to the user
    componentDidMount() {
        this.addListeners();
    };

    // getting the channels.
    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    };


    addNotificationListener = (channelId) => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel)
            {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);    
            }
        })
    }



    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;
        
        let index = notifications.findIndex(notification => notification.id === channelId);

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;

                // if new message or any multiple message then
                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }

            }

            notifications[index].lastKnownTotal = snap.numChildren();
        }
        else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),   // get the total number of messages
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }
        this.setState({ notifications });
    };


    // setting our first channel when the page loads.
    setFirstChannel = () => {

        const firstChannel = this.state.channels[0];

        // if the first channel is present then add to the global state
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel });
        }

        this.setState({ firstLoad: false });
    };


    getNotificationCount = (channel) => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if (notification.id === channel.id) {
                count = notification.count;
            }
        });

        if (count > 0) return count;
    }


    // function to print all the channels
    displayChannels = channels =>
        channels.length > 0 &&
        channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activChannel}
            >
                {this.getNotificationCount(channel) && (
                    <Label color="red">{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ));
    


    // adding our channel to firebase database.
    addChannel = () => {
        const { channelsRef,channelName,channelDetails,user } = this.state;

        // creating unique for each channels.
        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL

            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: '' });
                this.closeModal();
                console.log('channel added');
            })
            .catch(err => {
                console.error(err);
            })
    }

    // handleSubmit for creating channels and storing in our firebase database
    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChannel();  // adding our channel.
        }
    }

    

    // form validation function
    isFormValid = ({ channelName, channelDetails }) => {
        // checking that both the values are present or not.
        return (channelName && channelDetails);
    }


    // when the user is typing simultaneously changing the state.
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    // function for closing the modal
    closeModal = () => {
        this.setState({ modal: false });
    }

    // opening the modal
    openModal = () => {
        this.setState({ modal: true });
    }

    render() {

        const { channels,modal } = this.state;

        return (
            // grouping two components using React.Fragment
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        {/* Headding for channels */}
                        <span>
                            <Icon name="exchange" /> CHANNELS
                    </span>{" "}
                        {/* This paranthesis include the number of channels we have */}
                    ({channels.length}) <Icon name="add" onClick={this.openModal} /> 
                    </Menu.Item>
                    {/* display all the channels we have */}
                    {this.displayChannels(channels)}
                </Menu.Menu>

                {/* creating a modal for allowing the user to add channels. */}
                {/* Add channel modal.
                    open props to toggle the visibility of the modal
                    onClose prop for closing the modal
                    fluid prop is there to take the full width of the component */}
                <Modal basic open = {modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Add a Channel
                    </Modal.Header>
                    <Modal.Content>
                        <Form   onSubmit={this.handleSubmit} >
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    {/* adding or removing the channel */}
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark"/> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

// here the mapsStateToProps is null
export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels);