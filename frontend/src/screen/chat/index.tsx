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
import uuid from 'react-native-uuid';
import Svg, { Circle, Path } from 'react-native-svg';
import TextInputComponent from '../../components/Input/TextInputComponent';
import { checkIfHealthRelated } from '../../utils/checkIfHealthRelated';
import { API_BASE_URL } from '@env';

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

  const [inputText, setInputText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; base64: string }>();
  const [userName, setUserName] = useState('');

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

  // const sendMessage = async () => {
  //   const hasText = inputText.trim() !== '';
  //   const hasPdf = !!selectedPdf;

  //   if (!hasText && !hasPdf) return;

  //   const userMessage: Message = {
  //     id: uuid.v4().toString(),
  //     text: hasText ? inputText.trim() : `[${selectedPdf?.name} yüklendi]`,
  //     sender: 'user',
  //   };
  //   setMessages(prev => [...prev, userMessage]);
  //   setInputText('');

  //   // 🛑 SAĞLIK DIŞI SORGULARI ENGELLE
  //   if (hasText) {
  //     const isRelevant = await checkIfHealthRelated(inputText.trim());
  //     if (!isRelevant) {
  //       const warning: Message = {
  //         id: uuid.v4().toString(),
  //         text: '🤖 Üzgünüm, yalnızca sağlıkla ilgili konularda yardımcı olabilirim.',
  //         sender: 'ai',
  //       };
  //       setMessages(prev => [...prev, warning]);
  //       setSelectedPdf(undefined);
  //       return;
  //     }
  //   }

  //   const isPdfOnly = hasPdf && !hasText;
  //   const endpoint = `${API_BASE_URL}/${isPdfOnly ? 'upload' : 'message'}`;
  //   const payload = isPdfOnly
  //     ? { fileName: selectedPdf!.name, fileBase64: selectedPdf!.base64 }
  //     : { message: hasPdf ? `${inputText.trim()}\n\n[${selectedPdf?.name} yüklendi]` : inputText.trim() };

  //   try {
  //     const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await response.json();
  //     const aiMessage: Message = {
  //       id: uuid.v4().toString(),
  //       text: result.answer || 'Cevap alınamadı.',
  //       sender: 'ai',
  //     };
  //     setMessages(prev => [...prev, aiMessage]);
  //     setSelectedPdf(undefined);
  //   } catch (error: any) {
  //     console.error('🛑 API Hatası:', error.message || error);
  //   }
  // };

  const sendMessage = async () => {
  const hasText = inputText.trim() !== '';
  const hasPdf = !!selectedPdf;

  if (!hasText && !hasPdf) return;

  const userMessage: Message = {
    id: uuid.v4().toString(),
    text: hasText ? inputText.trim() : `[${selectedPdf?.name} yüklendi]`,
    sender: 'user',
  };
  setMessages(prev => [...prev, userMessage]);
  setInputText('');

  // 🛑 SAĞLIK DIŞI SORGULARI ENGELLE
  if (hasText) {
    const isRelevant = await checkIfHealthRelated(inputText.trim());

    if (!isRelevant) {
      const warning: Message = {
        id: uuid.v4().toString(),
        text: '🤖 Üzgünüm, yalnızca sağlıkla ilgili konularda yardımcı olabilirim.',
        sender: 'ai',
      };
      setMessages(prev => [...prev, warning]);
      setSelectedPdf(undefined);
      return;
    }
  }

  const isPdfOnly = hasPdf && !hasText;

  const endpoint = `${API_BASE_URL}/${isPdfOnly ? 'upload' : 'message'}`;

  const payload = isPdfOnly
    ? {
        fileName: selectedPdf!.name,
        fileBase64: selectedPdf!.base64,
      }
    : {
        message: hasPdf
          ? `${inputText.trim()}\n\n[${selectedPdf?.name} yüklendi]`
          : inputText.trim(),
      };

  // ✅ Hatalı payload gönderilmesini engelle
  if (!isPdfOnly && !payload.message) {
    console.warn('🚫 message değeri boş, API çağrılmayacak.');
    return;
  }

  // 📤 Logla
  console.log('📤 Gönderilen endpoint:', endpoint);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    const aiMessage: Message = {
      id: uuid.v4().toString(),
      text: result.answer || 'Cevap alınamadı.',
      sender: 'ai',
    };

    setMessages(prev => [...prev, aiMessage]);
    setSelectedPdf(undefined);
  } catch (error: any) {
    console.error('🛑 API Hatası:', error.message || error);
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
       
        <View  style={styles.userView}>
          
        </View>
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
  userView:{
    borderRadius:100,
    borderWidth:2,
    borderColor:'gray',
    height:40,
    width:40
  }
});

export default Chat;
