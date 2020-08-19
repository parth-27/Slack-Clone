import React, { Component } from 'react';
import { Menu, Icon } from "semantic-ui-react";

import firebase from '../../firebase';

import { connect } from 'react-redux';

import { setCurrentChannel,setPrivateChannel } from '../../actions';

class DirectMessages extends Component {
    
    state = {
        activeChannel: '',
        user: this.props.currentUser,
        users: [],
        userRef: firebase.database().ref('users'),
        // connectedREf will give info about user status i.e connected or not.
        connectedRef: firebase.database().ref('.info/connected'),
        //number of presence in the database shows the number of online users.
        presenceRef: firebase.database().ref("presence")
    }

    // when the component mounts
    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListeners();   
    }

    removeListeners = () => {
        this.state.userRef.off();
        this.state.presenceRef.off();
        this.state.connectedRef.off();
    }

    addListeners = (currentUserUid) => {
        let loadedUsers = [];
        // listening for the new children that are added.
        this.state.userRef.on('child_added', snap => {
            
            // we don't want to inlclude our selves the loged in user.
            if (currentUserUid !== snap.key) {
                let user = snap.val();
                user['uid'] = snap.key;
                user['status'] = 'offline';
                loadedUsers.push(user);
                this.setState({ users: loadedUsers });
            }
        });
        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);

                // if our user discoonect from the app then remove it
                ref.onDisconnect().remove(err => {
                    if (err !== null) {
                        console.error(err);
                    }
                })
            }
        });

        this.state.presenceRef.on('child_added', snap => {
            if (currentUserUid !== snap.key) {
                // add status to user
                this.addStatusToUser(snap.key);
            }
        });

        this.state.presenceRef.on('child_removed', snap => {
            if (currentUserUid !== snap.key) {
                // add status to user
                this.addStatusToUser(snap.key, false);
            }
        });
    }


    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user['status'] = `${connected ? 'online' : 'offline'}`;
            }
            return acc.concat(user);
        }, []);
        
        this.setState({ users: updatedUsers });
    }

    isUserOnline = user => user.status === 'online';


    changeChannel = (user) => {
        const channelId = this.getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name,  
        };

        // setting the data to the action
        this.props.setCurrentChannel(channelData);

        // putting the global state that this is a private channel
        this.props.setPrivateChannel(true);

        this.setActiveChannel(user.uid);
    }

    getChannelId = (userId) => {
        const currentUserId = this.state.user.uid;
        // creating the path of the channel
        // this will allows to make a unique channel identifier.
        return userId < currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`;
    }


    setActiveChannel = userId => {
        this.setState({ activeChannel: userId });
    }


    render() {
        const { users,activeChannel } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail"/> DIRECT MESSAGES
                    </span>{' '}
                    ({users.length})
                </Menu.Item>
                {/* Users to send Direct Messages */}
                {users.map(user => (
                    <Menu.Item
                        key={user.uid}
                        active={user.uid === activeChannel}
                        onClick={() => this.changeChannel(user)}
                        style={{ opacity: 0.7,fontStyle:'italic' }}
                    >
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? 'green':'red'}
                        />
                        @{user.name}
                    </Menu.Item>
                ))}

            </Menu.Menu>
        )
    }
}

export default connect(null, { setCurrentChannel,setPrivateChannel })(DirectMessages);
