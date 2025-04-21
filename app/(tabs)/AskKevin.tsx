import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function AskKevin() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you?', sender: 'bot' },
    { id: '2', text: 'Hi! I need some assistance.', sender: 'user' },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `You said: "${input}"`,
      sender: 'bot',
    };
    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
      Speech.speak(botMessage.text);
    }, 500);

    setInput('');
  };

  const startListening = async () => {
    try {
      // Configure audio mode for recording on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Request microphone permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('Permission to access microphone is required!');
        return;
      }

      setIsListening(true);
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      console.log('Recording started');
      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped. File saved at:', uri);
        setRecording(null);
        setIsListening(false);

        if (uri) {
          const transcript = await sendAudioToSpeechAPI(uri);
          setInput(transcript);
        }
      }
    } catch (error) {
      console.error('Error stopping audio recording:', error);
      setIsListening(false);
    }
  };

  const sendAudioToSpeechAPI = async (uri: string): Promise<string> => {
    console.log('Audio file URI:', uri);
    return 'Transcribed text from audio';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
          />
          <Button title="Send" onPress={handleSend} />
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={isListening ? stopListening : startListening}
          >
            <Text style={styles.voiceButtonText}>
              {isListening ? 'Stop' : 'Speak'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    padding: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 320,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  voiceButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
  },
  voiceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});