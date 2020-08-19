import React, { Component } from 'react';

import firebase from '../../firebase';


// for styling the Login form
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react";


// for linking Login form to login form.
import { Link } from 'react-router-dom';

// exporting as the default class
export default class Login extends Component {

    state = {
        email: "",
        password: "",
        errors: "",
        loading: false,
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
        if (this.isFormValid(this.state)) {

            // clearing the form.
            this.setState({ errors: [], loading: true });

            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedInUser => {
                    console.log(signedInUser);
                })
                .catch(err => {
                    console.error(err);
                    this.setState({ errors: this.state.errors.concat(err), loading: false });
                });
        }
    }


    // function to check if the given inputs are valid during login and destructuring them.
    isFormValid = ({ email, password }) => {
        return (email && password);
    }


    

    // show where the error is
    handleInputError = (errors, inputName) => {
        return Object.values(errors).some(error => error.message.toLowerCase().includes(inputName))
            ? "error"
            : "";
    };



    render() {

        // Destructuring all the values from the state object.
        const { email, password, errors, loading } = this.state;

        return (
            /* 
            1. Grid will be use to structure content within our Component
            2. textAlign and verticalAlign will center everthing on x and y axis
            3. maxwidth of the grid column will be 450 px
            4. header is used as h2 tags.
            5. name of the icon tag can be selected from the semantic ui documentation.
            */


            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ width: 450 }}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login for DevChat {/* Name of our App */}
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        {/* 
                        stacked for proper stacking of the Component in the form.
                        fluid to make the input the entire width of the parent Component. */}
                        <Segment stacked>

                            <Form.Input
                                fluid name="email"
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email Address"
                                onChange={this.handleChange}
                                value={email}
                                // for displaying the error field.
                                className={this.handleInputError(errors, "email")}
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


                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">
                                Login
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
                        Don't have an account ?  <Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}
