import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../navigation/context/AppContext';
import { useResponsive } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/NavigationTypes';
import CenterModal from '../../components/modal/CenterModal'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainLayout'>;

type UserType = {
  name: string;
  email?: string;
};

const User = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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

  const confirmLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setIsLoggedIn(false);
      setModalVisible(false);
      navigation.replace('Auth');
    } catch (error) {
      console.error('Çıkış sırasında hata:', error);
    }
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
      <Text style={[styles.header, { fontSize: 22 * fs1px }]}>Profil Bilgileri</Text>

      <View style={styles.infoBox}>
        <Text style={[styles.label, { fontSize: 16 * fs1px }]}>👤 Ad:</Text>
        <Text style={[styles.value, { fontSize: 15 * fs1px }]}>{user.name}</Text>

        {user.email ? (
          <>
            <Text style={[styles.label, { fontSize: 16 * fs1px }]}>📧 E-posta:</Text>
            <Text style={[styles.value, { fontSize: 15 * fs1px }]}>{user.email}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { paddingVertical: 14 * h1px, borderRadius: 10 * fs1px }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.logoutText, { fontSize: 16 * fs1px }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <CenterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmLogout}
        message="Oturumu kapatmak istiyor musun?"
      />
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
    fontWeight: '600',
    marginTop: 12,
    color: '#444',
  },
  value: {
    color: '#666',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
