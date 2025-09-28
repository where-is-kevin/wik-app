import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { StyleSheet, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import SearchBar from "@/components/SearchBar/SearchBar";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomText from "@/components/CustomText";
import BucketCard from "@/components/BucketComponent/BucketCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { useAddBucket, useBuckets, useCreateBucket } from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { bucketsHaveContent, likesHaveContent } from "@/utilities/hasContent";
import EmptyData from "@/components/EmptyData";
import { useLikes } from "@/hooks/useLikes";
import { Ionicons } from "@expo/vector-icons";
import FloatingMapButton from "@/components/FloatingMapButton";
import { ErrorScreen } from "@/components/ErrorScreen";

// Using SVG placeholder via BucketCard's OptimizedImage error handling

interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
  bucketShareUrl: string;
}

// Clean debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  const resetDebouncedValue = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedValue(newValue);
  }, []);

  return [debouncedValue, resetDebouncedValue] as const;
};

const ProfileListsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const listType = type === "buckets" || type === "likes" ? type : "buckets";

  // State
  const [activeTab, setActiveTab] = useState<"buckets" | "likes">(
    listType || "buckets"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(
    null
  );
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);

  // Debounced search
  const [debouncedSearchQuery, resetDebouncedValue] = useDebounce(
    searchQuery,
    600
  );

  // Infinite queries
  const bucketsQuery = useBuckets(
    debouncedSearchQuery,
    activeTab === "buckets"
  );
  const likesQuery = useLikes(debouncedSearchQuery, activeTab === "likes");

  // Mutations
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();


  // Flatten paginated data
  const buckets = useMemo(() => {
    return bucketsQuery.data?.pages.flatMap((page) => page.items) || [];
  }, [bucketsQuery.data]);

  const likes = useMemo(() => {
    return likesQuery.data?.pages.flatMap((page) => page.items) || [];
  }, [likesQuery.data]);

  // Transform data
  const transformedBucketsData = useMemo(() => {
    return buckets.map((bucket: any) => {
      // Filter valid items with proper null checks
      const validItems =
        bucket.content?.filter((item: any) => {
          const hasInternalImage =
            item.internalImageUrls &&
            Array.isArray(item.internalImageUrls) &&
            item.internalImageUrls.length > 0;
          const hasGoogleImage =
            item.googlePlacesImageUrl &&
            typeof item.googlePlacesImageUrl === "string" &&
            item.googlePlacesImageUrl.trim() !== "";
          return hasInternalImage || hasGoogleImage;
        }) || [];

      const images = validItems.slice(0, 3).map((item: any) => {
        if (
          item.internalImageUrls &&
          Array.isArray(item.internalImageUrls) &&
          item.internalImageUrls.length > 0
        ) {
          return item.internalImageUrls[0];
        }
        return item.googlePlacesImageUrl;
      });

      // Create stable array reference
      const finalImages = [...images];
      while (finalImages.length < 3) {
        finalImages.push(""); // Empty string for SVG placeholder
      }

      return {
        id: bucket.bucketId,
        title: bucket.bucketName,
        safeImages: finalImages,
        bucketShareUrl: bucket.bucketShareUrl,
      };
    });
  }, [buckets]);

  const transformedLikesData = useMemo(() => {
    return likes.map((like: any, index: number) => {
      let foodImage = ""; // Empty string for SVG placeholder
      if (like.internalImageUrls?.length > 0) {
        foodImage = like.internalImageUrls[0];
      } else if (like.googlePlacesImageUrl) {
        foodImage = like.googlePlacesImageUrl;
      } else if (like.image) {
        foodImage = like.image;
      }

      return {
        id: like.id,
        title: like.title || "Liked Item",
        foodImage,
        landscapeImage: "",
        category: like.category,
        hasIcon: true,
        contentShareUrl: like.contentShareUrl,
        height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall",
      };
    });
  }, [likes]);

  // Content checks
  const hasBucketsContent = bucketsHaveContent(buckets);
  const hasLikesContent = likesHaveContent(likes);

  // Event handlers
  const handleOpenLikesMap = () => {
    router.push(
      `/map-screen?source=${activeTab}&query=${encodeURIComponent(
        debouncedSearchQuery
      )}`
    );
  };

  const handleTabChange = useCallback(
    (tab: "buckets" | "likes") => {
      setActiveTab(tab);
      setSearchQuery("");
      resetDebouncedValue("");
    },
    [resetDebouncedValue]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeTab === "buckets") {
      bucketsQuery.refetch();
    } else {
      likesQuery.refetch();
    }
  }, [activeTab, bucketsQuery, likesQuery]);

  const handleLoadMore = useCallback(() => {
    if (activeTab === "buckets") {
      if (bucketsQuery.hasNextPage && !bucketsQuery.isFetchingNextPage) {
        bucketsQuery.fetchNextPage();
      }
    } else {
      if (likesQuery.hasNextPage && !likesQuery.isFetchingNextPage) {
        likesQuery.fetchNextPage();
      }
    }
  }, [activeTab, bucketsQuery, likesQuery]);

  // Bucket functionality
  const handleShowBucketBottomSheet = useCallback((likeItemId?: string) => {
    if (likeItemId) {
      setSelectedLikeItemId(likeItemId);
    }
    setIsBucketBottomSheetVisible(true);
  }, []);

  const handleCloseBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
  }, []);

  const handleItemSelect = useCallback(
    async (item: BucketItem) => {
      if (selectedLikeItemId) {
        try {
          await addBucketMutation.mutateAsync({
            id: item?.id,
            bucketName: item?.title,
            contentIds: [selectedLikeItemId],
          });
          setIsBucketBottomSheetVisible(false);
          setSelectedLikeItemId(null);
        } catch (error) {
          console.error("Failed to add item to bucket:", error);
        }
      }
    },
    [selectedLikeItemId, addBucketMutation]
  );

  const handleShowCreateBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  }, []);

  const handleCloseCreateBucketBottomSheet = useCallback(() => {
    setIsCreateBucketBottomSheetVisible(false);
  }, []);

  const handleCreateBucket = useCallback(
    async (bucketName: string) => {
      if (selectedLikeItemId) {
        try {
          await createBucketMutation.mutateAsync({
            bucketName,
            contentIds: [selectedLikeItemId],
          });
          setIsCreateBucketBottomSheetVisible(false);
          setActiveTab("buckets");
          setSelectedLikeItemId(null);
        } catch (error) {
          console.error("Failed to create bucket:", error);
        }
      }
    },
    [selectedLikeItemId, createBucketMutation]
  );

  const handleLikeItemPress = useCallback(
    (item: LikeItem) => {
      router.push(`/event-details/${item.id}`);
    },
    [router]
  );

  // Render functions
  const renderBucketItem = useCallback(
    ({ item }: { item: LocalBucketItem }) => (
      <BucketCard
        item={item}
        onPress={() => router.push(`/bucket-details/${item.id}`)}
      />
    ),
    [router]
  );

  const renderBucketsFooter = useCallback(() => {
    if (!bucketsQuery.isFetchingNextPage) return null;
    return (
      <CustomView style={styles.footerLoader}>
        <AnimatedLoader />
      </CustomView>
    );
  }, [bucketsQuery.isFetchingNextPage]);

  // Loading and refresh states
  const isInitialLoading =
    (activeTab === "buckets" && bucketsQuery.isLoading && !buckets.length) ||
    (activeTab === "likes" && likesQuery.isLoading && !likes.length);

  const isRefreshing =
    (activeTab === "buckets" &&
      bucketsQuery.isLoading &&
      !!bucketsQuery.data) ||
    (activeTab === "likes" && likesQuery.isLoading && !!likesQuery.data);

  // Error states
  const hasError =
    (activeTab === "buckets" && bucketsQuery.isError) ||
    (activeTab === "likes" && likesQuery.isError);

  const handleRetry = () => {
    if (activeTab === "buckets") {
      bucketsQuery.refetch();
    } else {
      likesQuery.refetch();
    }
  };

  // Show initial loading
  if (isInitialLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <BackHeader transparent={true} />
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
        </CustomView>
      </SafeAreaView>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <BackHeader transparent={true} />
        <ErrorScreen
          title={`Failed to load ${activeTab}`}
          message="Please check your connection and try again"
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackHeader transparent={true} />

      {/* Tab Navigation */}
      <CustomView style={styles.tabContainer}>
        <CustomTouchable
          style={styles.tab}
          onPress={() => handleTabChange("buckets")}
        >
          <CustomText
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "buckets"
                    ? colors.label_dark
                    : colors.gray_regular,
                fontFamily: "Inter-SemiBold",
              },
            ]}
          >
            Buckets
          </CustomText>
          {activeTab === "buckets" && (
            <CustomView
              style={styles.activeTabIndicator}
              bgColor={colors.label_dark}
            />
          )}
        </CustomTouchable>

        <CustomTouchable
          style={styles.tab}
          onPress={() => handleTabChange("likes")}
        >
          <CustomText
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "likes"
                    ? colors.label_dark
                    : colors.gray_regular,
                fontFamily: "Inter-SemiBold",
              },
            ]}
          >
            Likes
          </CustomText>
          {activeTab === "likes" && (
            <CustomView
              bgColor={colors.label_dark}
              style={styles.activeTabIndicator}
            />
          )}
        </CustomTouchable>
      </CustomView>

      {/* Search Bar */}
      <CustomView
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: verticalScale(16),
          height: 48,
        }}
      >
        <SearchBar
          placeholder={
            activeTab === "buckets"
              ? "Search your buckets"
              : "Search your likes"
          }
          value={searchQuery}
          onChangeText={handleSearchChange}
          containerStyle={{ ...styles.searchBarContainer, flex: 1, height: 48 }}
        />
      </CustomView>

      {/* Content */}
      <CustomView style={{ flex: 1 }}>
        {/* Initial Loading */}
        {isInitialLoading && (
          <CustomView style={styles.loaderContainer}>
            <AnimatedLoader />
          </CustomView>
        )}

        {/* Likes Tab */}
        {activeTab === "likes" && !isInitialLoading && (
          <CustomView style={{ flex: 1 }}>
            {hasLikesContent ? (
              <MasonryGrid
                data={transformedLikesData}
                onBucketPress={handleShowBucketBottomSheet}
                onItemPress={handleLikeItemPress}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                onLoadMore={handleLoadMore}
                hasNextPage={likesQuery.hasNextPage}
                isFetchingNextPage={likesQuery.isFetchingNextPage}
                contentContainerStyle={{ paddingBottom: verticalScale(80) }}
              />
            ) : (
              <EmptyData type="likes" />
            )}
          </CustomView>
        )}

        {/* Buckets Tab */}
        {activeTab === "buckets" && !isInitialLoading && (
          <CustomView style={{ flex: 1 }}>
            {hasBucketsContent ? (
              <FlatList
                data={transformedBucketsData}
                renderItem={renderBucketItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.bucketRow}
                contentContainerStyle={styles.bucketsContainer}
                showsVerticalScrollIndicator={false}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderBucketsFooter}
              />
            ) : (
              <EmptyData type="buckets" />
            )}
          </CustomView>
        )}
      </CustomView>

      {/* Bottom Sheets */}
      <BucketBottomSheet
        selectedLikeItemId={selectedLikeItemId}
        isVisible={isBucketBottomSheetVisible}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
      />

      <CreateBucketBottomSheet
        isVisible={isCreateBucketBottomSheetVisible}
        onClose={handleCloseCreateBucketBottomSheet}
        onCreateBucket={handleCreateBucket}
      />

      {/* Floating Map Button - Only show for likes tab */}
      {activeTab === "likes" && hasLikesContent && (
        <FloatingMapButton onPress={handleOpenLikesMap} hasTabBar={false} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: verticalScale(16),
    justifyContent: "center",
    gap: horizontalScale(8),
  },
  tab: {
    paddingBottom: verticalScale(4),
    position: "relative",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabText: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Medium",
  },
  searchBarContainer: {
    marginBottom: verticalScale(16),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bucketsContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(20),
    gap: verticalScale(16),
  },
  bucketRow: {
    justifyContent: "space-between",
  },
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileListsScreen;
