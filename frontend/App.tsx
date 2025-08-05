// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/navigation/context/AppContext';
import { Dimensions } from 'react-native';
import useDeviceStore from './src/store/useDeviceStore';

const App = () => {
  const setDimensions = useDeviceStore(state => state.setDimensions);

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions(width, height);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    updateDimensions();

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
