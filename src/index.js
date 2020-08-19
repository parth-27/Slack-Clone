import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import firebase from "./firebase"; // when we logged in or register to the application.

import "semantic-ui-css/semantic.min.css"; // we are using semantic ui for our styles and markup in the project.

// Setting up routing for our application
import { BrowserRouter as Router, Switch, Route, withRouter } from "react-router-dom"; // we can change name of named import using as keyword.

// for allowing to access the info of logged in user data we are using redux. i.e. putting data to the global state for every component to access.
import { createStore } from 'redux';

import { Provider,connect } from 'react-redux'; // connect() will set the user info to the global state.

import { composeWithDevTools } from 'redux-devtools-extension';	// inorder to setup our redux devtools extension.

import rootReducer from "./reducers";	// reducer to change or get the user info.

import Spinner from './Spinner';

import { setUser,clearUser } from "./actions/index";


// create our global state.
const store = createStore(rootReducer, composeWithDevTools());


// Root will contain all of our routes
class Root extends React.Component {

	// we will execute a listener when this Root components mounts.
	// we will use life cycle method for this.
	componentDidMount() {
		// console.log(this.props.isLoading);
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.props.setUser(user);
				// this will redirect to the '/' url when we are login.
				this.props.history.push('/');
			}
			else {
				// push to the login screen when user not found.
				this.props.history.push('/login');
				this.props.clearUser();	// for clearing our user from the global state.
			}
		})
	}

	render() {
		// preventing our user to see the blank screen we are using ternary in return
		return this.props.isLoading ? <Spinner />  : (
			<Switch>
				{/* For not matching the multiple components add exact keyword to the root path */}
				<Route exact path="/" component={App} />{" "}
				{/* component app will be display on / url */}
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
			</Switch>
		);
	}
}


// here we are wrapping Root with the withRouter a higher order component.
/* withRouter is a higher order component that will pass closest route's match , current location , 
   and history props to the wrapped component whenever it renders. simply it connects component to 
   the router.
*/

const mapStateFromProps = (state) => ({
	isLoading:state.user.isLoading
});

// connect will allows us to connect our redux state and actions with a given component.
const RootWithAuth = withRouter(connect(mapStateFromProps,{setUser,clearUser})(Root));

// Provider will provide the global state to any component that want to use it.
ReactDOM.render(
	<Provider store = {store}>
		<Router ><RootWithAuth /> </Router >
	</Provider>
	,
	document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
