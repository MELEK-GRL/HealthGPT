import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../navigation/context/AppContext';
import { useResponsive } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/NavigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainLayout'>;

type UserType = {
  name: string;
  email?: string; // ⬅️ Artık zorunlu değil
};

const User = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigation = useNavigation<NavigationProp>();
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
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Evet',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['token', 'user']);
            setIsLoggedIn(false);
            navigation.replace('Auth');
          } catch (error) {
            console.error('Çıkış sırasında hata:', error);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil Bilgileri</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>👤 Ad:</Text>
        <Text style={styles.value}>{user.name}</Text>

        {user.email ? (
          <>
            <Text style={styles.label}>📧 E-posta:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    padding: 24,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#444',
  },
  value: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
