import React, { useState } from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useContentWithParams } from '@/hooks/useContent';
import AskKevinSection from '@/components/Section/AskKevinSection';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router"; // Import useSearchParams


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const PaginatedContentList = () => {
  const { query } = useLocalSearchParams(); // Get the query parameter from the route
  const [params, setParams] = useState({
    query: query || "cake", // Use the query parameter or default to 'cake'
    limit: 10,
    offset: 0,
  });
  const { data, isLoading, isFetching, refetch } = useContentWithParams(params);

  const loadMore = () => {
    setParams((prevParams) => ({
      ...prevParams,
      offset: prevParams.offset + prevParams.limit,
    }));
    refetch();
  };

  const handleLike = () => {
    console.log("Liked:", data?.id);
    refetch();
  };
  const handleDislike = () => {
    console.log("Disliked:", data?.id);
    refetch();
  };

  const renderItem = ({ item }: { item: typeof data[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.googlePlacesImageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <View style={styles.iconLinkRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
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

  return (
    <View style={{ flex: 1 }}>
      <AskKevinSection />
      {isLoading ? (
        <View
          style={[styles.card, { justifyContent: "center", alignItems: "center" }]}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListFooterComponent={
            <View style={{ padding: 16, alignItems: "center" }}>
              {isFetching ? (
                <ActivityIndicator size="small" />
              ) : (
                <TouchableOpacity onPress={loadMore} style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    marginHorizontal: screenWidth * 0.05,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: '50%',
    backgroundColor: '#eee',
  },
  textContainer: {
    padding: 15,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  category: {
    fontSize: 16,
    color: '#6C63FF',
    marginBottom: 4,
  },
  iconLinkRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  iconLink: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 40,
  },
  iconButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 5,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PaginatedContentList;