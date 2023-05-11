import React from 'react';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import UserStack from './userStack';
import AuthStack from './authStack';

//using a turnary switch and selects the correct navigation stack based on login status
export default function RootNavigation() {
    const { user } = useAuthentication();
    return user ? <UserStack /> : <AuthStack/>;
}