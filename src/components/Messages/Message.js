import React from 'react'
import { Comment,Image } from 'semantic-ui-react';

// date and time formating library moment.
import moment from 'moment';

// this function will determine the id of the current user is same id of the user that created the message.
const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? 'message__self' : '';
}

// display image if file is uploaded
const isImage = (message) => {
    // if it has its own property of image then return true.
    return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
}

const timeFromNow = (timestamp) => moment(timestamp).fromNow();

const Message = ({message,user}) => (
    <Comment>
        <Comment.Avatar src={message.user.avatar}/>
        <Comment.Content className={isOwnMessage(message,user)}>
            <Comment.Author as="a">
                    {message.user.name}
            </Comment.Author>
            <Comment.Metadata>
                    {timeFromNow(message.timestamp)}
            </Comment.Metadata>
            {isImage(message) ? <Image src={message.image} className="message__image" />
                :
                <Comment.Text>{message.content}</Comment.Text>
                }
        </Comment.Content>
    </Comment>
);

export default Message;