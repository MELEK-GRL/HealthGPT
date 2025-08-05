import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';

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

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geçmiş Konuşmalar</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handlePress(item._id)}
            >
              <Text style={styles.text}>Sohbet {index + 1}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString('tr-TR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz konuşma yok.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  item: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 13, color: '#888', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20 },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default History;
