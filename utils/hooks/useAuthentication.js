import {useEffect, useState} from 'react';
import firebase from 'firebase';

const auth = firebase.auth();

//react hook function for checking the login status of the user.
//used in selecting the correct navigation stack 
export function useAuthentication() 
{
    const [user, setUser] = useState(undefined);
    
    useEffect(() => {
        const unsubscribeFromAuthStatusChanged = auth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in
            setUser(user);
          } else {
            // User is signed out
            setUser(undefined);
          }
        });
    
        return unsubscribeFromAuthStatusChanged;
      }, []);
    
      return {
        user
      };
    }