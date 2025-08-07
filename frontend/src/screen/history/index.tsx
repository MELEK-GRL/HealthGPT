import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';
import { useResponsive } from '../../utils/responsive';
import colors from '../../theme/colors';
import { useUserStore } from '../../store/userStore';
import CenterModal from '../../components/modal/CenterModal';
import TopBar from '../../components/TopBar/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const user = useUserStore(state => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (isFocused) {
      fetchConversations();
    }
  }, [isFocused]);

  const onClose = async () => {
    setModalVisible(false);
  };
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
    content: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 16 * w1px,
    },
    title: {
      fontSize: 20 * fs1px,
      fontWeight: '500',
      marginBottom: 16 * h1px,
      color: colors.backgroundPruple,
    },
    item: {
      backgroundColor: '#ffffff',
      paddingHorizontal: 10 * h1px,
      paddingVertical: 12 * h1px,
      marginBottom: 12 * h1px,
      borderRadius: 10 * fs1px,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.backgroundPrupleSoft,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 1 },
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
    avatar: {
      width: 40 * w1px,
      height: 40 * w1px,
      borderRadius: 90,
      borderWidth: 1,
      borderColor: colors.backgroundPruple,
    },
    listCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listCardTextView: {
      paddingLeft: w1px * 16
    }

  });

  return (
    <View style={styles.content}>
      <TopBar />
      <View style={styles.container}>

        <Text style={styles.title}>Konuşma Geçmişi</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <TouchableOpacity style={styles.listCard} onPress={() => handlePress(item._id)}>
                <View>
                  <Image source={require('../../assets/icons/historyIcon.png')} style={styles.avatar} />
                </View>
                <View style={styles.listCardTextView}>
                  <Text style={styles.text}>Sohbet {index + 1}</Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </Text>
                </View>

              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(true)} >
                <Icon name="trash-outline" size={22 * fs1px} color={colors.backgroundPruple} />
              </TouchableOpacity>
              <CenterModal
                visible={modalVisible}
                onClose={onClose}
                onConfirm={() => handleDelete(item._id)}
                message="Silmek İstediğinize emin misiniz??"
              />
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Henüz konuşma yok.</Text>}
        />


      </View>
    </View>
  );
};

export default History;
