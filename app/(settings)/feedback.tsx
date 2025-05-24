import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSendFeedback } from '@/hooks/useFeedback'; // Import the custom hook
import { useRouter } from 'expo-router'; // Import useRouter

const { width: screenWidth } = Dimensions.get('window');

const FeedbackForm = () => {
  const router = useRouter(); // Initialize the router
  const [rating, setRating] = useState(0);
  const [likes, setLikes] = useState<string[]>([]); // Updated to match the new model
  const [improvements, setImprovements] = useState<string[]>([]); // Updated to match the new model
  const [feedback, setFeedback] = useState('');

  const sendFeedback = useSendFeedback(); // Use the custom hook

  const likeOptions = ['Easy to use', 'Complete', 'Helpful', 'Convenient', 'Looks good'];
  const improvementOptions = [
    'Could have more components',
    'Complex',
    'Not interactive',
    'Only English',
  ];

  const toggleSelection = (option: string, selectedList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedList.includes(option)) {
      setList(selectedList.filter((item) => item !== option));
    } else {
      setList([...selectedList, option]);
    }
  };

  const handleSubmit = () => {
    const feedbackData = {
      rating,
      likes, // Updated to match the new model
      improvements, // Updated to match the new model
      feedback,
    };

    sendFeedback.mutate(feedbackData, {
      onSuccess: () => {
        console.log('Feedback submitted successfully', feedbackData);
        // Reset form after successful submission
        setRating(0);
        setLikes([]); // Reset likes
        setImprovements([]); // Reset improvements
        setFeedback('');
      },
      onError: (error) => {
        console.error('Feedback submission error:', error);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate your experience</Text>
      <Text style={styles.subtitle}>
        We here to serve you and improve. Any feedback will help make things even better in the future!
      </Text>

      {/* Rating Section */}
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color="#6C63FF"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Likes Section */}
      <Text style={styles.sectionTitle}>What did you like about it?</Text>
      <View style={styles.optionsContainer}>
        {likeOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              likes.includes(option) && styles.selectedOptionButton,
            ]}
            onPress={() => toggleSelection(option, likes, setLikes)} // Updated to use likes
          >
            <Text
              style={[
                styles.optionText,
                likes.includes(option) && styles.selectedOptionText, // Updated to use likes
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Improvements Section */}
      <Text style={styles.sectionTitle}>What could be improved?</Text>
      <View style={styles.optionsContainer}>
        {improvementOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              improvements.includes(option) && styles.selectedOptionButton, // Updated to use improvements
            ]}
            onPress={() => toggleSelection(option, improvements, setImprovements)} // Updated to use improvements
          >
            <Text
              style={[
                styles.optionText,
                improvements.includes(option) && styles.selectedOptionText, // Updated to use improvements
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Input */}
      <Text style={styles.sectionTitle}>Anything else?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Tell us everything."
        placeholderTextColor="#aaa"
        multiline
        value={feedback}
        onChangeText={setFeedback}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={sendFeedback.isLoading} // Disable button while submitting
      >
        <Text style={styles.submitButtonText}>
          {sendFeedback.isLoading ? 'Submitting...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#6C63FF',
  },
  optionText: {
    fontSize: 14,
    color: '#6C63FF',
  },
  selectedOptionText: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedbackForm;