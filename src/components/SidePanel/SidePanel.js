import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'

import UserPanel from './UserPanel';
import Channels from './Channels';
import Starred from './Starred';
import DirectMessages from './DirectMessages';

export default class SidePanel extends Component {
    render() {
        const { currentUser } = this.props;
        return (
            // creating a menu in the side panel using semantic ui react
            <Menu
                size="large"
                inverted
                fixed="left"
                vertical
                style = {{background:'#4c3c4c',fontSize:'1.2rem'}}
            >
            
                <UserPanel currentUser={currentUser} />
                <Starred currentUser = {currentUser} />
                <Channels currentUser={currentUser} />
                <DirectMessages currentUser={currentUser} />   {/* Direct Message between users */}
            </Menu>
        )
    }
}
