import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import PdfUpload from '../pdf/PdfUpload';
import Icon from 'react-native-vector-icons/Ionicons';
import { useResponsive } from '../../utils/responsive';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  onPdfSelected: (pdf: { name: string; base64: string }) => void;
  selectedPdf?: { name: string };
};

const TextInputComponent: React.FC<Props> = ({
  value,
  onChangeText,
  onSendPress,
  onPdfSelected,
  selectedPdf,
}) => {
  const sendEnabled = value.trim() !== '' || selectedPdf;
  const styles = useResponsiveStyles(); // responsive stiller

  return (
    <View style={styles.container}>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Sağlık sorununu yaz..."
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />
      </View>

      <PdfUpload onPdfSelected={onPdfSelected} selectedPdf={selectedPdf} />

      <TouchableOpacity
        style={[styles.sendButton, { opacity: sendEnabled ? 1 : 0.5 }]}
        disabled={!sendEnabled}
        onPress={onSendPress}
      >
        <Icon name="send" size={20 * styles.fs1px} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// 🔧 Responsive stil fonksiyonu
const useResponsiveStyles = () => {
  const { w1px, h1px, fs1px } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 10 * w1px,
      paddingVertical: 8 * h1px,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    inputArea: {
      flex: 1,
      backgroundColor: '#f1f3f6',
      borderRadius: 25 * fs1px,
      paddingHorizontal: 15 * w1px,
      paddingVertical: 8 * h1px,
      marginRight: 8 * w1px,
    },
    input: {
      fontSize: 16 * fs1px,
      color: '#333',
      maxHeight: 100 * h1px,
    },
    sendButton: {
      backgroundColor: '#0057d9',
      borderRadius: 25 * fs1px,
      padding: 10 * fs1px,
      marginLeft: 5 * w1px,
      shadowColor: '#0057d9',
      shadowOpacity: 0.5,
      shadowOffset: { width: 0, height: 3 * h1px },
      shadowRadius: 4 * fs1px,
      elevation: 4,
    },
   
  });

  return { ...styles, fs1px }; // fs1px'yi dışarı aktarıyoruz çünkü Icon size'ında kullandık
};

export default TextInputComponent;
