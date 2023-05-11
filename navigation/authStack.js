import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/Login';
import SignUpScreen from '../screens/SignUp';

const Stack = createStackNavigator();

//The navigation stack an unauthorised user get to explore
export default function AuthStack() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}