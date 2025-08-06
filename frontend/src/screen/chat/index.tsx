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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import TextInputComponent from '../../components/Input/TextInputComponent';
import { checkIfHealthRelated } from '../../utils/checkIfHealthRelated';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadingAI from '../splash/LoadingAI';

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
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; base64: string }>();
  const [userName, setUserName] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

useEffect(() => {
  const fetchConversationMessages = async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/conversations/detail/${conversationId}`);
      const data = await response.json();

      if (data && data.messages) {
        const formattedMessages = data.messages.map((m: any, index: number) => ({
          id: index.toString(),
          text: m.text,
          sender: m.sender,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('🛑 Konuşma mesajları alınamadı:', error);
    }
  };

  fetchConversationMessages();
}, [conversationId]);


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

  useEffect(() => {
    if (!conversationId) {
      const welcomeMessage: Message = {
        id: uuid.v4().toString(),
        text: `👨‍⚕️ Merhaba ${userName || ''}! Ben Doktor AI. Size nasıl yardımcı olabilirim?`,
        sender: 'ai',
      };
      setMessages([welcomeMessage]);
      setCurrentConversationId(null);
    }
  }, [conversationId, userName]);

const sendMessage = async () => {
  setIsLoading(true);

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

  const endpoint = `${API_BASE_URL}/upload`;

  // ✅ Dinamik payload
  const payload: Record<string, string> = {};
  if (hasText) {
    payload.text = inputText.trim();
  }
  if (hasPdf && selectedPdf?.name && selectedPdf?.base64) {
    payload.fileName = selectedPdf.name;
    payload.fileBase64 = selectedPdf.base64;
  }
console.log('📤 Gönderilen payload:', JSON.stringify(payload, null, 2)); 
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('--->result', JSON.stringify(result, null, 2));

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
      if (currentConversationId) {
        await fetch(`${API_BASE_URL}/conversations/${currentConversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ text: m.text, sender: m.sender })),
          }),
        });
      } else {
        const createRes = await fetch(`${API_BASE_URL}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            messages: updatedMessages.map(m => ({ text: m.text, sender: m.sender })),
          }),
        });
        const newConv = await createRes.json();
        setCurrentConversationId(newConv._id);
      }
    }
  } catch (error: any) {
    console.error('🛑 API Hatası:', error.message || error);
  }
  setIsLoading(false);

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
  style={styles.headerNewChatButton}
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
  <View style={styles.newChatContent}>
    <Icon name="chatbubble-ellipses-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
    <Text style={styles.headerNewChatText}>Yeni Sohbet</Text>
  </View>
</TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerText}>{userName}</Text>
        </View>
      </View>
{isLoading?
<LoadingAI/>:

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={renderMessage}
      />
}

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

export const useResponsiveStyles = () => {
  const { w1px, h1px, fs1px } = useResponsive();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafd' },
    headerContent: {
      flexDirection: 'row',
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
    headerNewChatButton: {
  backgroundColor: '#4B7BE5',
  paddingVertical: 8 * h1px,
  paddingHorizontal: 14 * w1px,
  borderRadius: 20 * fs1px,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
  elevation: 4,
},
newChatContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
headerNewChatText: {
  fontSize: 15 * fs1px,
  fontWeight: '600',
  color: '#fff',
},

  });
};

export default Chat;
