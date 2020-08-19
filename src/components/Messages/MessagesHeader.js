import React, { Component } from 'react'

import {Header,Segment,Input,Icon} from 'semantic-ui-react';

export default class MessagesHeader extends Component {
    render() {

        const { channelName, numUniqueUsers, handleSearchChange,
            searchLoading, isPrivateChannel,handleStar,isChannelStarred } = this.props;

        return (
            // we are using floating items so clearing prop
            <Segment clearing>
                {/* Channel Tittle */}
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        {channelName} {/*displaying channel name*/}

                        {/* if it is public channel than show star icon otherwise don't */}
                        {/* Clicking the star you can starred the channel */}
                        {!isPrivateChannel &&
                            (<Icon
                            onClick={handleStar}
                            name={isChannelStarred ? 'star':'star outline'}
                            color={isChannelStarred ? 'yellow' : 'black'} />)
                        }
                    
                    
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>

                {/* Channel Search Input */}
                <Header floated="right">
                    <Input
                        loading={searchLoading}
                        onChange = {handleSearchChange}   // searching the messages in the chat. function is in the messages.js
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    >

                    </Input>
                </Header>
            </Segment>
        )
    }
}
