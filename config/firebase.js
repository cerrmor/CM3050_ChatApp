import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

//API access information
const firebaseConfig = {
  apiKey: "AIzaSyDiZ30rTozNbA_3nVR-5pS03m2qLxjgODg",
  authDomain: "messengerapp-5626a.firebaseapp.com",
  databaseURL: "https://messengerapp-5626a-default-rtdb.firebaseio.com",
  projectId: "messengerapp-5626a",
  storageBucket: "messengerapp-5626a.appspot.com",
  messagingSenderId: "806498311986",
  appId: "1:806498311986:web:cbfb8774d8796062aec12b",
  measurementId: "G-WYZ67V0VC3"
};

//initilises the firebase api access
if (!firebase.apps.length)
{
  firebase.initializeApp(firebaseConfig);
}

//exported firebase functions for API usage
export const auth = firebase.auth();
export const database = firebase.firestore();
export const storage = firebase.storage();
export {firebase}