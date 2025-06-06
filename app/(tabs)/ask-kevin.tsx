import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useContentWithParams } from "@/hooks/useContent";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import CustomText from "@/components/CustomText";

const PaginatedContentList = () => {
  const { query } = useLocalSearchParams(); // Get the query parameter from the route
  const { colors } = useTheme();
  const [params, setParams] = useState({
    query: query || "cake", // Use the query parameter or default to 'cake'
    limit: 10,
    offset: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isError, refetch } = useContentWithParams(params);

  const onRefresh = async () => {
    setRefreshing(true);
    setParams((prevParams) => ({
      ...prevParams,
      offset: prevParams.offset + prevParams.limit,
    }));
    setRefreshing(false);
  };

  // Handle input changes with debouncing to avoid too many API calls
  const handleInputChange = (text: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      if (text.trim() === "") {
        // When input is cleared, either remove query param or use default
        setParams({
          limit: 10,
          offset: 0,
          query: "cake",
        });
      }
    }, 500);
  };

  const handleSend = (message: string) => {
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setParams({
      query: message,
      limit: 10,
      offset: 0,
    });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Transform data to match LikeItem interface
const transformedData: LikeItem[] =
  data && Array.isArray(data.items)
    ? data.items.map((item, index) => ({
        id: item.id,
        title: item.title,
        foodImage: item.googlePlacesImageUrl || "",
        landscapeImage: "",
        isExperience: true,
        hasIcon: true,
        height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall", // Random height for masonry effect
      }))
    : [];

  const handleBucketPress = () => {
    // Handle bucket press logic here
    console.log("Bucket pressed");
  };

  const handleItemPress = (item: LikeItem) => {
    // Handle item press logic here
    console.log("Item pressed:", item.title);
  };

  return (
    <CustomView bgColor={colors.background} style={{ flex: 1 }}>
      <AskKevinSection onSend={handleSend} onInputChange={handleInputChange} />
      {isLoading && !refreshing ? (
        <CustomView style={{ flex: 1 }}>
          <AnimatedLoader />
        </CustomView>
      ) : transformedData.length > 0 ? (
        <MasonryGrid
          data={transformedData}
          onBucketPress={handleBucketPress}
          onItemPress={handleItemPress}
          showVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingBottom: 20,
            marginTop: verticalScale(12),
            paddingHorizontal: horizontalScale(24),
          }}
        />
      ) : (
        <CustomView style={styles.errorContainer}>
          <CustomText style={styles.errorText}>
            No results found for "{params.query}"
          </CustomText>
          <CustomText style={styles.errorSubtext}>
            Try searching for something else
          </CustomText>
        </CustomView>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default PaginatedContentList;
