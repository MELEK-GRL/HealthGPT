import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';

const Register = () => {
  const navigation = useNavigation();
  const { w1px, h1px, fs1px } = useResponsive();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const body: any = {
        name,
        password,
      };

      // Eğer email girildiyse body'e ekle
      if (email.trim() !== '') {
        body.email = email.trim();
      }

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        navigation.navigate('MainLayout' as never);
      } else {
        Alert.alert('Başarısız', data.message || 'Hata oluştu.');
      }
    } catch (error: any) {
      console.error('❌ Register error:', error.message || error);
      Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamıyor.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafd',
      justifyContent: 'center',
      padding: 24 * w1px,
    },
    title: {
      fontSize: 26 * fs1px,
      fontWeight: 'bold',
      marginBottom: 28 * h1px,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#fff',
      padding: 14 * h1px,
      borderRadius: 10 * fs1px,
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 16 * h1px,
      fontSize: 15 * fs1px,
    },
    button: {
      backgroundColor: '#34C759',
      paddingVertical: 16 * h1px,
      borderRadius: 10 * fs1px,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16 * fs1px,
    },
    link: {
      marginTop: 20 * h1px,
      color: '#007AFF',
      textAlign: 'center',
      fontSize: 14 * fs1px,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        placeholder="İsim"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email (opsiyonel)"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;
