import React, { Component } from 'react';

import { connect } from 'react-redux';

import { setCurrentChannel, setPrivateChannel } from '../../actions';

import { Menu, Icon } from 'semantic-ui-react';

import  firebase  from '../../firebase';

class Starred extends Component {

    state = {
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        starredChannels: [],
        activChannel: '',
    };

    // when the page loads
    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    }

    addListeners = (userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel = { id: snap.key, ...snap.val() };
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel]
                });
            });
        
        // when the channel is unstarred
        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove = { id: snap.key, ...snap.val() };
                const filteredChannels = this.state.starredChannels.filter(channel => {
                    return channel.id !== channelToRemove.id;
                });

                this.setState({
                    starredChannels: filteredChannels
                });
            })
    }

    setActiveChannel = (channel) => {

        this.setState({ activChannel: channel.id });
    }

    // changing the channel
    changeChannel = channel => {
        // display the user which channel is selected
        this.setActiveChannel(channel);

        this.props.setCurrentChannel(channel);

        // changing our private channel to public channel
        this.props.setPrivateChannel(false);

    };

    // function to print all the channels
    displayChannels = starredChannels =>
        starredChannels.length > 0 &&
        starredChannels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activChannel}
            >
                # {channel.name}
            </Menu.Item>
        ));

    render() {

        const { starredChannels } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    {/* Starred Channels */}
                    <span>
                        <Icon name="star" /> STARRED
                    </span>{" "}
                    {/* This paranthesis include the number of starred channels we have */}
                    ({starredChannels.length})
                </Menu.Item>
                {/* display all the starred channels we have */}
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}

export default connect(null,{setPrivateChannel,setCurrentChannel})(Starred);
