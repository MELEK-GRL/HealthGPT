import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Settings from '../screen/settings';
import Chat from '../screen/chat';
import User from '../screen/user/User';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Settings" component={Settings} />
       <Tab.Screen name="User" component={User} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
