import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';

import { connect } from 'react-redux';

// importing all the required component.
import ColorPanel from './ColorPanel/ColorPanel';
import Messages from './Messages/Messages';
import SidePanel from './SidePanel/SidePanel';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel,isPrivateChannel,userPosts }) => (
	// when we pass multiple state to the components its important to give them a unique key.
	<Grid columns="equal" className="app" style={{background:'#eee'}}>
		<ColorPanel />
		<SidePanel
			currentUser={currentUser} 
			key={currentUser && currentUser.uid}
			/>
		<Grid.Column style={{marginLeft:320}}>
			<Messages
				key={currentChannel && currentChannel.id}
				currentChannel={currentChannel} 
				currentUser={currentUser}
				isPrivateChannel = {isPrivateChannel}
				/>
		</Grid.Column>
		<Grid.Column width={4}>
			{/* hide the MetaPanel when we are personal messaging to other user */}
			<MetaPanel
				key={currentChannel && currentChannel.id}
				userPosts = {userPosts}
				currentChannel = {currentChannel}
				isPrivateChannel={isPrivateChannel} 	
			/>
		</Grid.Column>
	</Grid>
)


// using the connect function in app so that all of its child component can use the global state without connect.
const mapsStateToProps = state => ({
	currentUser: state.user.currentUser,
	currentChannel: state.channel.currentChannel,
	// whether the given channel is private or not.
	isPrivateChannel: state.channel.isPrivateChannel,

	// getting the users posts count
	userPosts : state.channel.userPosts,
})

export default connect(mapsStateToProps)(App);
