import * as actionTypes from './types'; // import all the types


// USER ACTIONS.
// creating our first actions.
export const setUser = user => {
    //Payload is what is bundled in your actions and passed around between reducers in your redux application
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser:user
        }
    }
}

// clearing the user from global state.

export const clearUser = () => {
    return {
        type:actionTypes.CLEAR_USER
    }
    
}


// CHANNEL ACTIONS.
export const setCurrentChannel = (channel) => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel : channel
        }
    }
}

export const setPrivateChannel = (isPrivateChannel) => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel
        }
    }
}

export const setUserPosts = (userPosts) => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload: {
            userPosts,
        }
    }
}