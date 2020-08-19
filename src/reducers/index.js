import { combineReducers } from 'redux';  

import * as actionTypes from '../actions/types';


const initialUserState = {
    currentUser: null,
    isLoading: true,
};


// creating our reducer function.
// reducing user related data.
const user_reducer = (state = initialUserState, action) => {
    switch (action.type)
    {
        // setting the user
        case actionTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading:false
            }
        // clearing the user from the global state.
        case actionTypes.CLEAR_USER:
            // spreading all the properties of the state
            return {
                ...state,
                isLoading:false
            }
        default:
            return state;
    }
}


const initialChannelState = {
    currentChannel: null,
    isPrivateChannel: false,
    userPosts: null,  
};

const channel_reducer = (state = initialChannelState,action) => {
    switch(action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel:action.payload.currentChannel
            }
        case actionTypes.SET_PRIVATE_CHANNEL:
            return {
                ...state,
                isPrivateChannel:action.payload.isPrivateChannel
            }
        case actionTypes.SET_USER_POSTS:
            return {
                ...state,
                userPosts:action.payload.userPosts,
            }
        default:
            return state;
    }
}



// we want our reducer function to operate on certain part on state.
// combineReducers will allows us to determine what property on global state the reducer updates.
// here we are only allowing to change the user property only.
const rootReducer = combineReducers({
    user: user_reducer,
    channel:channel_reducer
});


export default rootReducer;
