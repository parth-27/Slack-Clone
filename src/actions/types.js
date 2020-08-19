// an action type will be responsible for determining what type of change we want to make to our global state.


//User Action Types
// creating our first type.
// setting the user
export const SET_USER = "SET_USER";

// clearing the user from the global state.
export const CLEAR_USER = "CLEAR_USER";



// channel Action Types
// setting the info about the selected channel
export const SET_CURRENT_CHANNEL = "SET_CURRENT_CHANNEL";

// private channel
export const SET_PRIVATE_CHANNEL = "SET_PRIVATE_CHANNEL";

// for users posts
export const SET_USER_POSTS = "SET_USER_POSTS";