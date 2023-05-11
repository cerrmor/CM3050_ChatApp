import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/Home';
import UserProfileScreen from '../screens/UserProfile';
import SelectedChatScreen from '../screens/SelectedChatGroup';
import NewChatGroupScreen from '../screens/NewChatGroup';

const Stack = createStackNavigator();

//this is the navigation stack that the authorised user gets to explore
export default function UserStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={UserProfileScreen} />
        <Stack.Screen name="SelectedChatGroup" component={SelectedChatScreen} />
        <Stack.Screen name="NewChatGroup" component={NewChatGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}