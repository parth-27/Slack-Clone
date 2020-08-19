import firebase from 'firebase/app';    // since we are using the firebase with all the configuration data

import "firebase/auth";     // sub dependencies for autherization.

import "firebase/database";     // for using the realtime database.

import "firebase/storage";      // it will allows us to store things like media files.

import "firebase/analytics";    // for using the analytics method.


var firebaseConfig = {
    apiKey: "", // add your own api key.
    authDomain: "slack-clone-e7646.firebaseapp.com",
    databaseURL: "https://slack-clone-e7646.firebaseio.com",
    projectId: "slack-clone-e7646",
    storageBucket: "slack-clone-e7646.appspot.com",
    messagingSenderId: "924809837350",
    appId: "1:924809837350:web:70a7606410d9163f595fe7",
    measurementId: "G-3Q0EG73X1N"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


export default firebase;