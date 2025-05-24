import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useContent } from "@/hooks/useContent";
import { Ionicons } from "@expo/vector-icons";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types.ts";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SwipeableCards = () => {
  const { data: content, isLoading, error, refetch } = useContent();
  const [isListening, setIsListening] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Prepare data for FlatList
  const data = content
    ? [
        {
          id: content.id,
          image: content.googlePlacesImageUrl,
          title: content.title,
          match: content.rating
            ? `${Math.round(content.rating * 20)}% Match`
            : "",
          tags: content.tags || "",
          category: content.category || "",
          rating: content.rating ? content.rating.toFixed(1) : "",
          description: content.description || "",
          reviews: content.reviews || "",
          websiteUrl: content.websiteUrl || content.bookingUrl,
          googleMapsUrl: content.googleMapsUrl,
          latitude: content.latitude, // Ensure latitude is available
          longitude: content.longitude, // Ensure longitude is available
        },
      ]
    : [];

  const handleLike = () => {
    console.log("Liked:", content?.id);
    refetch();
  };

  const handleDislike = () => {
    console.log("Disliked:", content?.id);
    refetch();
  };

  const handleAskKevinSend = (text: string) => {
    console.log("AskKevin send:", text);
    // Add your logic here
  };

  const handleMicPress = () => {
    setIsListening((prev) => !prev);
    // Add your mic logic here
  };

  const handleLocationPress = (latitude: number, longitude: number) => {
    navigation.navigate("MapScreen", { latitude, longitude }); // Updated route
  };

  const renderItem = ({ item }: { item: (typeof data)[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <View style={styles.iconLinkRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
        <View style={styles.iconLinkRow}>
          <Text style={styles.category}>{item.category}</Text>
          {item.latitude && item.longitude ? (
            <TouchableOpacity
              onPress={() => handleLocationPress(item.latitude, item.longitude)} // Use handleLocationPress
              style={styles.iconLink}
            >
              <Ionicons name="location" size={28} color="#34a853" />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* tags */}
        <Text style={{ color: "#6C63FF", fontSize: 16, marginBottom: 4 }}>
          {item.tags}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleDislike}>
            <Ionicons name="thumbs-down" size={32} color="#ff5252" />
          </TouchableOpacity>
          {item.websiteUrl ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.websiteUrl)}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-up" size={32} color="#4caf50" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
            <Ionicons name="thumbs-up" size={32} color="#4caf50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.card,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.card,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "red" }}>Failed to load content.</Text>
        <TouchableOpacity style={styles.button} onPress={refetch}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AskKevinSection
        onSend={handleAskKevinSend}
        onMicPress={handleMicPress}
        isListening={isListening}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    marginHorizontal: screenWidth * 0.05,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: "50%",
    backgroundColor: "#eee",
  },
  textContainer: {
    padding: 15,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  category: {
    fontSize: 16,
    color: "#6C63FF",
    marginBottom: 4,
  },
  iconLinkRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  iconLink: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 40,
  },
  iconButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 10,
  },
});

export default SwipeableCards;
