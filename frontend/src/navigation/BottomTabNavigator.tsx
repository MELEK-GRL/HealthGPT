import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Chat from '../screen/chat';
import User from '../screen/user/User';
import History from '../screen/history';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="History" component={History} />
       <Tab.Screen name="User" component={User} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
