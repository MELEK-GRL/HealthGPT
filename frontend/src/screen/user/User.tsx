import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../navigation/context/AppContext';
import { useResponsive } from '../../utils/responsive';

type UserType = {
  name: string;
  email: string;
};

const User = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigation = useNavigation();
  const { setIsLoggedIn } = useAppContext();
  const { w1px, h1px, fs1px } = useResponsive();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Oturumu kapatmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles({ w1px, h1px, fs1px }).center}>
        <Text style={styles({ w1px, h1px, fs1px }).loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const s = styles({ w1px, h1px, fs1px });

  return (
    <View style={s.container}>
      <Text style={s.header}>Profil Bilgileri</Text>

      <View style={s.infoBox}>
        <Text style={s.label}>👤 Ad:</Text>
        <Text style={s.value}>{user.name}</Text>

        <Text style={s.label}>📧 E-posta:</Text>
        <Text style={s.value}>{user.email}</Text>
      </View>

      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Text style={s.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default User;

const styles = ({
  w1px,
  h1px,
  fs1px,
}: {
  w1px: number;
  h1px: number;
  fs1px: number;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafd',
      padding: 24 * w1px,
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16 * fs1px,
      color: '#666',
    },
    header: {
      fontSize: 22 * fs1px,
      fontWeight: '700',
      marginBottom: 24 * h1px,
      textAlign: 'center',
      color: '#333',
    },
    infoBox: {
      backgroundColor: '#fff',
      borderRadius: 12 * fs1px,
      padding: 20 * h1px,
      marginBottom: 32 * h1px,
      elevation: 2,
    },
    label: {
      fontSize: 16 * fs1px,
      fontWeight: '600',
      marginTop: 12 * h1px,
      color: '#444',
    },
    value: {
      fontSize: 15 * fs1px,
      color: '#666',
      marginBottom: 8 * h1px,
    },
    logoutButton: {
      backgroundColor: '#ff3b30',
      paddingVertical: 14 * h1px,
      borderRadius: 10 * fs1px,
      alignItems: 'center',
    },
    logoutText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16 * fs1px,
    },
  });
