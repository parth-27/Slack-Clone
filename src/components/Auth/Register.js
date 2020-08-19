import React, { Component } from 'react';

import firebase from '../../firebase';

// md5 is Messaging-Digest-Algorithm-5. It is used as cryptographic hash.
// we are using to create a unique value to provide to the gravatar site
import md5 from 'md5';  // import for our avatar image of the register user.

// for styling the register form
import { Grid, Form, Segment, Button, Header, Message, Icon} from "semantic-ui-react";


// for linking register form to login form.
import { Link } from 'react-router-dom';

// exporting as the default class
export default class Register extends Component {


    state = {
        username : "",
        email : "",
        password: "",
        passwordConfirmation: "",
        errors: "",
        loading: false,
        userRef:firebase.database().ref('users')
    }


    // checking wether the form is empty or not.
    // destructuring the input of the isFormEmpty method as state is passed in the parameter.
    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    }

    // checking wether the password is valid or not.
    isPasswordValid = ({ password, passwordConfirmation }) => {
        if (password.length < 8 || passwordConfirmation.length < 8)
            return false;
        else if (password !== passwordConfirmation)
            return false;
        else
            return true;
    }
    

    // for form validation
    isFormValid = () => {

        let errors = [];
        let error;

        if (this.isFormEmpty(this.state))
        {
            // throw error.    
            error = { message: "Fill in all Fields" };
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        else if (!this.isPasswordValid(this.state)) {
            // throw error.
            error = { message: "Password is invalid" };
            this.setState({ errors: errors.concat(error) });
            return false;
        } 
        else
        {
            // form is valid
            return true;
        }
    }


    // this function will be used to update states.
    handleChange = (event) => {
        // setting the state from  the given intput. It will update as we are typing in the given field.
        this.setState({ [event.target.name]: event.target.value });
    };

    // this function will be used to handle submit button.
    handleSubmit = (event) => {
        
        event.preventDefault();     // preventing default action of the submit button. i.e reload the page

        // submit the form if all the inputs are valid then only.
        if (this.isFormValid()) {

            // clearing the form.
            this.setState({ errors: [], loading: true });

            // for this we need to enable sigin provider in the firebase authenication.
            // we can also enable sigin through facebook ,github ,etc.
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)  // as this is a promise we need a then method.
                .then(createUser => {

                    console.log(createUser);

                    // setting userName field as username and photoUrl as the avatar image for user.
                    createUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(createUser.user.email)}?d=identicon`
                    })
                        .then(() => {
                            this.saveUser(createUser).then(() => {
                                console.log("User Saved");
                            });
                        })
                        .catch(err => {
                            this.setState({ errors: this.state.errors.concat(err), loading: false });
                        })
                    console.log("User Created");
                })
                .catch(Error => {       // catching the error.
                    console.error(Error);
                    this.setState({ errors: this.state.errors.concat(Error), loading: false });
                });
        }
    }


    // save user to our firebase realtime database.
    saveUser = (createdUser) => {
        // userRef in the state is the reference of the user from the firebase database.
        return this.state.userRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    }

    // show where the error is
    handleInputError = (errors, inputName) => {
        return Object.values(errors).some(error => error.message.toLowerCase().includes(inputName))
            ? "error"
            : "";
    };



    render() {

        // Destructuring all the values from the state object.
        // we will pass this as the value parameter and by doing so we can clear the form when we submit it.
        const { username, email, password, passwordConfirmation,errors,loading } = this.state;
        
        return (
            /* 
            1. Grid will be use to structure content within our Component
            2. textAlign and verticalAlign will center everthing on x and y axis
            3. maxwidth of the grid column will be 450 px
            4. header is used as h2 tags.
            5. name of the icon tag can be selected from the semantic ui documentation.
            */


            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ width:450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register for DevChat {/* Name of our App */}
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        {/* 
                        stacked for proper stacking of the Component in the form.
                        fluid to make the input the entire width of the parent Component. */}
                        <Segment stacked>
                            <Form.Input
                                fluid name="username"
                                icon="user"
                                iconPosition="left"
                                placeholder="Username"
                                onChange={this.handleChange}
                                value={username}
                                type="text"
                            />

                            <Form.Input
                                fluid name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                onChange={this.handleChange}
                                value={email}
                                // for displaying the error field.
                                className={this.handleInputError(errors,"email")}
                                type="email"
                            />

                            <Form.Input
                                fluid name="password"
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                onChange={this.handleChange}
                                value={password}
                                className={this.handleInputError(errors, "password")}
                                type="password"
                            />

                            <Form.Input
                                fluid name="passwordConfirmation"
                                icon="repeat"
                                iconPosition="left"
                                placeholder="Password Confirmation"
                                onChange={this.handleChange}
                                value={passwordConfirmation}
                                className={this.handleInputError(errors, "password")}
                                type="password"
                            />

                            <Button disabled={loading} className={loading ? 'loading':''} color="orange" fluid size="large">
                                Submit
                            </Button>
                        </Segment>
                    </Form>

                    {/* display the errors to the user if they are there */}
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {/* display the error message */}
                            {errors.map((error, i) =>
                                (<p key={i}>{error.message}</p>)
                            )}
                        </Message>
                    )}
                    <Message>
                        Already a user ? <Link to="/login">Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}
