import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';
import colors from '../../theme/colors';
import { useUserStore } from '../../store/userStore'; // ✅ kullanıcıyı store'dan çek

type RootStackParamList = {
  Chat: { conversationId: string };
  History: undefined;
};

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

type Conversation = {
  _id: string;
  createdAt: string;
};

const History = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { w1px, h1px, fs1px } = useResponsive();
  const isFocused = useIsFocused();
  const user = useUserStore(state => state.user); // ✅ kullanıcıyı store'dan al

  useEffect(() => {
    if (isFocused) {
      fetchConversations();
    }
  }, [isFocused]);

  const fetchConversations = async () => {
    if (!user?._id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${user._id}`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('🛑 Konuşmalar alınamadı:', error);
    }
  };

  const handlePress = (conversationId: string) => {
    navigation.navigate('Chat', { conversationId });
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (error) {
      console.error('🗑️ Silme hatası:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 16 * w1px,
    },
    title: {
      fontSize: 22 * fs1px,
      fontWeight: 'bold',
      marginBottom: 16 * h1px,
      color: colors.backgroundPruple,
      textAlign: 'center',
    },
    item: {
      backgroundColor: '#ffffff',
      padding: 16 * h1px,
      marginBottom: 12 * h1px,
      borderRadius: 10 * fs1px,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#A89CC8',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 5,
    },
    text: {
      fontSize: 16 * fs1px,
      fontWeight: 'bold',
      color: '#333',
    },
    date: {
      fontSize: 13 * fs1px,
      color: '#888',
      marginTop: 4 * h1px,
    },
    emptyText: {
      textAlign: 'center',
      color: '#aaa',
      marginTop: 20 * h1px,
      fontSize: 14 * fs1px,
    },
    deleteButton: {
      backgroundColor: colors.backgroundPruple,
      paddingVertical: 6 * h1px,
      paddingHorizontal: 10 * w1px,
      borderRadius: 6 * fs1px,
      marginLeft: 10 * w1px,
    },
    deleteText: {
      color: '#fff',
      fontSize: 13 * fs1px,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geçmiş Konuşmalar</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => handlePress(item._id)}>
              <Text style={styles.text}>Sohbet {index + 1}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString('tr-TR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz konuşma yok.</Text>}
      />
    </View>
  );
};

export default History;
