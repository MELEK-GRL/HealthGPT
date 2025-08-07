import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/NavigationTypes';
import { useResponsive } from '../../utils/responsive';

import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';
type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const Splash = ({ navigation }: Props) => {
  const { w1px, h1px, fs1px } = useResponsive();


  const handleContinue = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        navigation.replace('MainLayout');
      } else {
        navigation.replace('Auth');
      }
    } catch (error) {
      console.error('Splash kontrol hatası:', error);
      navigation.replace('Auth');
    }
  };


  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/splashGif/health.json')}
        autoPlay
        loop
        style={{ width: 300 * w1px, height: 300 * h1px }}
      />

      <TouchableOpacity style={[styles.button, { marginTop: 40 * h1px }]} onPress={handleContinue}>
        <Text style={[styles.buttonText, { fontSize: 16 * fs1px }]}>Devam Et</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.backgroundPruple,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.textWhite,
    fontWeight: '600',
  },
});
