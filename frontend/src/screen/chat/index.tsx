import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import TextInputComponent from '../../components/Input/TextInputComponent';
import { checkIfHealthRelated } from '../../utils/checkIfHealthRelated';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

type RootStackParamList = {
  Chat: { conversationId?: string };
};

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const Chat: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const conversationId = route.params?.conversationId;
  const styles = useResponsiveStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; base64: string }>();
  const [userName, setUserName] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  // Kullanıcı bilgisini çek
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

  // Eğer geçmiş konuşma varsa çek
  useEffect(() => {
 const fetchConversation = async () => {
  if (!conversationId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/conversations/detail/${conversationId}`);
    const text = await response.text(); 
    const data = JSON.parse(text);
    const restored = data.messages.map((msg: any, index: number) => ({
      id: uuid.v4().toString(),
      text: msg.text,
      sender: msg.sender,
    }));

    setMessages(restored);
  } catch (err) {
    console.error( err);
  }
};


    fetchConversation();
  }, [conversationId]);

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

    if (!isPdfOnly && !payload.message) {
      console.warn('🚫 message değeri boş, API çağrılmayacak.');
      return;
    }

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

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      setSelectedPdf(undefined);

      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);

        // 🔁 Eğer mevcut conversation varsa güncelle, yoksa oluştur
        if (currentConversationId) {
          await fetch(`${API_BASE_URL}/conversations/${currentConversationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: updatedMessages.map(m => ({
                text: m.text,
                sender: m.sender,
              })),
            }),
          });
        } else {
          const createRes = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              messages: updatedMessages.map(m => ({
                text: m.text,
                sender: m.sender,
              })),
            }),
          });

          const newConv = await createRes.json();
          setCurrentConversationId(newConv._id);
        }
      }
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
      
 <View style={styles.headerContent}>
<TouchableOpacity
  style={styles.headerMsg}
  onPress={() => {
    const welcomeMessage: Message = {
      id: uuid.v4().toString(),
      text: `👨‍⚕️ Merhaba ${userName || ''}! Ben Doktor AI. Size nasıl yardımcı olabilirim?`,
      sender: 'ai',
    };
    setMessages([welcomeMessage]);
    setCurrentConversationId(null);
  }}
>
  <Text style={styles.headerMsgText}>Yeni Sohbet</Text>
</TouchableOpacity>
  <View style={styles.header}>
    <Text style={styles.headerText}>{userName}</Text>
    {/* <View style={styles.userView} /> */}
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

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9fafd' },
//   headerContent:{
// flexDirection:'row',
// width:'100%',
// justifyContent:'space-between',
// alignItems:'center',
//    padding: 12,
//     backgroundColor: '#fff',
//   },
//   headerMsg:{
//     backgroundColor:'gray',
//      padding: 8,
//      borderRadius:6,
//   },
//    headerMsgText: {
//     marginRight: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
 
//   },
//   headerText: {
//     marginRight: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   messagesList: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
//   messageBubble: {
//     padding: 12,
//     borderRadius: 16,
//     marginVertical: 6,
//     maxWidth: '75%',
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   userBubble: {
//     backgroundColor: '#c7f0db',
//     alignSelf: 'flex-end',
//   },
//   aiBubble: {
//     backgroundColor: '#e0e7ff',
//     alignSelf: 'flex-start',
//   },
//   messageText: { fontSize: 16, color: '#333' },
//   userView: {
//     borderRadius: 100,
//     borderWidth: 2,
//     borderColor: 'gray',
//     height: 40,
//     width: 40,
//   },
// });
export const useResponsiveStyles = () => {
  const { w1px, h1px, fs1px } = useResponsive();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafd',
    },
    headerContent: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12 * h1px,
      backgroundColor: '#fff',
    },
    headerMsg: {
      backgroundColor: 'gray',
      padding: 8 * h1px,
      borderRadius: 6 * fs1px,
    },
    headerMsgText: {
      fontSize: 16 * fs1px,
      fontWeight: '600',
      color: 'white',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 16 * fs1px,
      fontWeight: '600',
      color: '#333',
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: 20 * w1px,
      paddingTop: 10 * w1px,
    },
    messageBubble: {
      padding: 12 * fs1px,
      borderRadius: 16 * fs1px,
      marginVertical: 6 * fs1px,
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
    messageText: {
      fontSize: 16 * fs1px,
      color: '#333',
    },
  });
};

export default Chat;
