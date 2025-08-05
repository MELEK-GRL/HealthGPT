
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import PdfUpload from '../pdf/PdfUpload';
import Icon from 'react-native-vector-icons/Ionicons';

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

  return (
    <View style={styles.container}>
      {selectedPdf && (
        <Icon
          name="document-text-outline"
          size={22}
          color="#007aff"
          style={styles.pdfIcon}
        />
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Sağlık sorununu yaz..."
        placeholderTextColor="#999"
        multiline
        textAlignVertical="top"
      />

      <PdfUpload onPdfSelected={onPdfSelected} />

      <TouchableOpacity
        style={[styles.sendButton, { opacity: sendEnabled ? 1 : 0.5 }]}
        disabled={!sendEnabled}
        onPress={onSendPress}
      >
        <Text style={styles.sendButtonText}>Gönder</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: '#f1f3f6',
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#0057d9',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    shadowColor: '#0057d9',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  pdfIcon: {
    marginRight: 10,
  },
});

export default TextInputComponent;
