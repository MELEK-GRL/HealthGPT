import React from 'react';
import BottomTabNavigator from '../../navigation/BottomTabNavigator';
import { SafeAreaView } from 'react-native';


const MainLayout = () => {
  return <>
    <SafeAreaView style={{ flex: 1, }}>
      <BottomTabNavigator />
    </SafeAreaView>
  </>;
};

export default MainLayout;
