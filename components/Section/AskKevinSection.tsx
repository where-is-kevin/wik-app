import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
} from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from 'expo-av';

type AskKevinSectionProps = {
  onSend?: (message: string) => void;
  onMicPress?: () => void;
  isListening?: boolean;
  onSettingsPress?: () => void;
};

const AskKevinSection = ({
  onSend,
  onMicPress,
  isListening: isListeningProp,
  onSettingsPress,
}: AskKevinSectionProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    if (input.trim() === "") return;
    console.log("AskKevin: Send pressed", input);
    onSend?.(input);
    setInput("");
    Keyboard.dismiss();
  };

  const handleMic = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
    onMicPress?.();
  };

  const handleSettings = () => {
    console.log("AskKevin: Settings pressed");
    onSettingsPress?.();
  };

  const handleInputFocus = () => {
    console.log("AskKevin: Input focused");
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    console.log("AskKevin: Input changed", text);
  };

  // --- Listening functions ---
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
        Alert.alert("Permission to access microphone is required!");
        return;
      }

      setIsListening(true);
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      console.log("Recording started");
      setRecording(newRecording);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Recording stopped. File saved at:", uri);
        setRecording(null);
        setIsListening(false);

        if (uri) {
          const transcript = await sendAudioToSpeechAPI(uri);
          setInput(transcript);
        }
      }
    } catch (error) {
      console.error("Error stopping audio recording:", error);
      setIsListening(false);
    }
  };

  const sendAudioToSpeechAPI = async (uri: string): Promise<string> => {
    console.log("Audio file URI:", uri);
    // Replace this with your actual speech-to-text API call
    return "Transcribed text from audio";
  };

  return (
    <CustomView
      bgColor={colors.lime}
      style={[
        styles.askKevinHeader,
        { paddingTop: insets.top + verticalScale(12) },
      ]}
    >
      <View style={styles.inputRow}>
        {/* Sparkle Icon */}
        <View style={styles.sparkleContainer}>
          <Ionicons
            name="sparkles"
            size={24}
            color={colors.profile_name_black}
          />
        </View>
        {/* Ask Kevin TextInput */}
        <TextInput
          style={styles.inputRow}
          placeholder="Ask Kevin..."
          placeholderTextColor={colors.profile_name_black + "99"}
          value={input}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSend}
          onFocus={handleInputFocus}
          returnKeyType="send"
        />
        {/* Mic Button */}
        <TouchableOpacity style={styles.iconButton} onPress={handleMic}>
          <Ionicons
            name={isListening ? "mic-off" : "mic"}
            size={24}
            color={isListening ? "#ff5252" : colors.profile_name_black}
          />
        </TouchableOpacity>
        {/* Settings Button with Red Dot */}
        <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={24}
            color={colors.profile_name_black}
          />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  askKevinHeader: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(10),
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: "#D4FF3F", // fallback lime
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: scaleFontSize(16),
    marginRight: 10,
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#E9FF8A",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sparkleContainer: {
    marginRight: 10,
  },
  askKevinTitle: {
    fontSize: scaleFontSize(18),
    flex: 1,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF2D55",
  },
});

export default AskKevinSection;