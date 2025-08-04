import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextInputComponent from '../../components/Input/TextInputComponent';
import { API_BASE_URL } from '@env';
import Svg, { Circle, Path } from 'react-native-svg';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba, ben Doktor AI. Tahlil sonuçlarınızı analiz edebilirim. Size nasıl yardımcı olabilirim?',
      sender: 'ai',
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; base64: string }>();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      }
    };
    fetchUser();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() && !selectedPdf) return;

    const userMessage: Message = {
      id: (messages.length + 1).toString(),
      text: inputText.trim() || `[${selectedPdf?.name} yüklendi]`,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedPdf ? 'upload' : 'message'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          selectedPdf
            ? { fileName: selectedPdf.name, fileBase64: selectedPdf.base64 }
            : { message: inputText.trim() }
        ),
      });

      const result = await response.json();

      const botMessage: Message = {
        id: (messages.length + 2).toString(),
        text: result.answer,
        sender: 'ai',
      };

      setMessages(prev => [...prev, botMessage]);
      setSelectedPdf(undefined);
    } catch (error) {
      console.error('🛑 API Hatası:', error);
    }
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{userName}</Text>
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="2" />
          <Path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
            fill="#555"
          />
          <Path
            d="M6 20c0-2.67 4-4 6-4s6 1.33 6 4"
            stroke="#555"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={renderMessage}
      />

      <TextInputComponent
        value={inputText}
        onChangeText={setInputText}
        onSendPress={sendMessage}
        onPdfSelected={setSelectedPdf}
        selectedPdf={selectedPdf}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafd' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  headerText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messagesList: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#c7f0db',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#e0e7ff',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 16, color: '#333' },
});

export default Chat;
