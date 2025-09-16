import React, { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, ListRenderItem, View } from "react-native";
import CustomView from "@/components/CustomView";
import LikeCard from "@/components/LikeComponent/LikeCard";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

interface LikeItem {
  id: string;
  title: string;
  foodImage: string | any;
  landscapeImage: string;
  hasIcon?: boolean;
  height?: "short" | "tall";
  category: string;
  contentShareUrl: string;
}

interface MasonryGridProps {
  data: LikeItem[];
  onBucketPress: (likeItemId: string) => void;
  onItemPress?: (item: LikeItem) => void;
  // Infinite pagination props
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  // Refresh props
  refreshing?: boolean;
  onRefresh?: () => void;
  // Optional scroll props
  showVerticalScrollIndicator?: boolean;
  contentContainerStyle?: object;
  // Scroll direction tracking
  onScroll?: (event: any) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  data,
  onBucketPress,
  onItemPress,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
  refreshing = false,
  onRefresh,
  showVerticalScrollIndicator = false,
  contentContainerStyle,
  onScroll,
}) => {
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Process data to ensure all items have valid images
  const processedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        foodImage: item.foodImage || PLACEHOLDER_IMAGE,
      })),
    [data]
  );

  // Split data into two columns for true masonry effect (like original)
  const { leftColumn, rightColumn } = useMemo(() => {
    const left = processedData.filter((_, index) => index % 2 === 0);
    const right = processedData.filter((_, index) => index % 2 === 1);
    return { leftColumn: left, rightColumn: right };
  }, [processedData]);

  // Create a single item that contains both columns for FlatList
  const masonryData = useMemo(() => {
    return [{ id: "masonry-columns", leftColumn, rightColumn }];
  }, [leftColumn, rightColumn]);

  // Render the masonry columns (same as original ScrollView approach)
  const renderColumn = useCallback(
    (columnData: LikeItem[]) => (
      <View style={styles.columnContainer}>
        {columnData.map((item, index) => (
          <View key={item.id}>
            <LikeCard
              onBucketPress={() => onBucketPress(item.id)}
              item={item}
              onPress={() => onItemPress?.(item)}
            />
          </View>
        ))}
      </View>
    ),
    [onBucketPress, onItemPress]
  );

  // Render the single FlatList item containing both columns
  const renderMasonryColumns: ListRenderItem<any> = useCallback(
    ({ item }) => (
      <View style={styles.columnsContainer}>
        {renderColumn(item.leftColumn)}
        {renderColumn(item.rightColumn)}
      </View>
    ),
    [renderColumn]
  );

  // Footer component for loading state
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <AnimatedLoader customAnimationStyle={styles.loader} />
      </View>
    );
  }, [isFetchingNextPage]);

  // Handle load more with proper threshold
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <FlatList
      data={masonryData}
      renderItem={renderMasonryColumns}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={showVerticalScrollIndicator}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      // Scroll tracking
      onScroll={onScroll}
      scrollEventThrottle={16}
      // Refresh Control
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#666"
            colors={["#666"]}
          />
        ) : undefined
      }
      // Infinite Pagination - Built-in FlatList props!
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3} // Trigger when 30% from bottom
      ListFooterComponent={renderFooter}
      // Performance optimizations
      removeClippedSubviews={false} // Keep false for masonry layout
      maxToRenderPerBatch={1} // Only one item (the columns container)
      windowSize={3}
      initialNumToRender={1}
    />
  );
};

const styles = {
  container: {
    paddingHorizontal: horizontalScale(24),
    paddingLeft: horizontalScale(22),
  },
  columnsContainer: {
    flexDirection: "row" as const,
    gap: 10,
    alignItems: "flex-start" as const,
    justifyContent: "space-between" as const,
  },
  columnContainer: {
    width: 160,
  },
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loader: {
    width: 80,
    height: 80,
  },
};

export default MasonryGrid;
export type { LikeItem, MasonryGridProps };
