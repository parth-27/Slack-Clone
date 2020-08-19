import React, { Component } from 'react';       
import { Segment, Comment } from "semantic-ui-react";
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';

import firebase from '../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';


class Messages extends Component {

    state = {
        // creating messages ref to store messages in the firebase.
        messagesRef: firebase.database().ref('messages'),
        // updating users data.
        usersRef : firebase.database().ref('users'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        // reference to the private messages.
        privateMessagesRef: firebase.database().ref('privateMessages'),
        isChannelStarred: false,
        listeners:[],
        
    }


    // displaying the messages on the screen as soon as the component loads
    componentDidMount() {
        const { channel, user,listeners } = this.state;
        
        // if both channel and user are present
        if (channel && user)
        {
            this.removeListeners(listeners);
            this.addListener(channel.id);    

            // getting info about the starred channels which user has starred them
            this.addUserStarsListener(channel.id, user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners);
        //this.state.connectedRef.off();
    }
    

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        });
    };


    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event;
        })

        if (index === -1)
        {
            const newListener = { id, ref, event };
            this.setState({ listeners: this.state.listeners.concat(newListener) });
        }   

    }

    componentDidUpdate(prevProps,prevState) {
        if (this.messagesEnd) {
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    };

    // getting the starred channels
    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')  // once method to gets its value
            .then(data => {
                if (data.val() !== null ) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);

                    // current channel is a starred channel
                    this.setState({ isChannelStarred: prevStarred });
                }
            })
    }

    // starring the channel
    handleStar = () => {
        this.setState(prevState => ({
            // assigining the opposite value then the previous value of isChannelStarred
            isChannelStarred : !prevState.isChannelStarred
        }),() => this.starChannel());
    }

    starChannel = () => {
        if (this.state.isChannelStarred) {
            // update the user that has starred the channel and store in the firebase
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar:this.state.channel.createdBy.avatar
                        }
                    }
                });
        }
        else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err !== null) {
                        console.error(err);
                    }
                });
        }
    }

    addListener = channelId => {
        this.addMessageListener(channelId); 
    }

    // listening for any new messages that are added.
    addMessageListener = channelId => {
        let loadedMessages = [];

        const ref = this.getMessagesRef();

        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
            });
            this.countUniqueUsers(loadedMessages);

            // for getting the top poster of the channel
            this.countUserPosts(loadedMessages);
        });

        // removing listener
        this.addToListeners(channelId, ref, "child_added");
    }


    // storing messages from our private channel
    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state;
        
        // if private channel then privateMessagesRef otherwise messagesRef
        return privateChannel ? privateMessagesRef : messagesRef;
    }


    // searching messages in the chat
    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => (
            this.handleSearchMessages()
        ));
    }


    // filtering messages
    handleSearchMessages = () => {
        // copying the messages.
        const channelMessages = [...this.state.messages];

        // providing a pattern to regex which is dynamic to the searchTerm value. gi means globally and case insensitive
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            
            // we can search message or we can search messages from a specific user.
            if (
                (message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(()=>this.setState({ searchLoading: false }),1000);
    }


    //counting the unique users in the channel
    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            //check if accumlator array includes user name
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({ numUniqueUsers });
    }

    // counting the users post
    countUserPosts = messages => {
        let uesrPosts = messages.reduce((acc, message) => {
            
            // checking if the username is present in the current accumalator or not.
            if (message.user.name in acc)
            {
                acc[message.user.name].count += 1;
            }
            // if username is not present then add the object to the accumalator.
            else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count : 1
                }
            }

            return acc;
        }, {});
        

        // setting the userPosts to global state so we can use it in MetaPanel Component
        this.props.setUserPosts(uesrPosts);
    } 


    // iterating over all the messages.
    displayMessages = (messages) =>
        // if length is greater than 0 then iterate over the array
        messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
                
            />
        ));
    
    
    displayChannelName = channel => {
        // if channel is present display the channel and check if it is private or public channel.
        // display @ if it is private and # if it is public.
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''; 
    }


    render() {

        const { messagesRef, channel, user, messages, numUniqueUsers,
            searchResults, searchTerm, searchLoading, privateChannel,
            isChannelStarred} = this.state;

        return (
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred = {isChannelStarred}
                />
                
                <Segment>
                    <Comment.Group className="messages">
                        {/* Messages */}
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        <div ref={node => (this.messagesEnd = node)}></div>
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef} 
                    currentChannel={channel}
                    currentUser={user}
                    isPrivateChannel={privateChannel}
                    getMessagesRef = {this.getMessagesRef}
                    />
            </React.Fragment>
        );
    }
}

export default connect(null,{setUserPosts})(Messages);