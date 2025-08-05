// Login.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';

const Login = ({ navigation }: any) => {
 const [name, setName] = useState(''); // 👈 yeni
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { w1px, h1px, fs1px } = useResponsive();

  const handleLogin = async () => {
    const url = `${API_BASE_URL}/auth/login`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
      await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('name', name); 
      } else {
        Alert.alert('Giriş Hatalı', data.message || 'Hatalı e-posta ya da şifre');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.message || error);
      Alert.alert('Sunucu Hatası', error.message || 'Sunucuya bağlanılamadı.');
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
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 16 * h1px,
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
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        placeholder="Adınız"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        placeholder="Email"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
