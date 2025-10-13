import React, { useCallback, useMemo, useRef } from "react";
import { FlatList, RefreshControl, View, ListRenderItem } from "react-native";
import LikeCard from "@/components/LikeComponent/LikeCard";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

export interface LikeItem {
  id: string;
  title: string | null;
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

// Masonry container for true column layout
interface MasonryContainer {
  id: string;
  leftColumn: LikeItem[];
  rightColumn: LikeItem[];
  showLoader: boolean;
}

// Memoized card component to prevent unnecessary re-renders
const MemoizedLikeCard = React.memo<{
  item: LikeItem;
  onBucketPress: () => void;
  onPress: () => void;
}>(({ item, onBucketPress, onPress }) => (
  <LikeCard onBucketPress={onBucketPress} item={item} onPress={onPress} />
));

MemoizedLikeCard.displayName = "MemoizedLikeCard";

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
  const flatListRef = useRef<FlatList>(null);
  const loadingRef = useRef(false);

  // Process data into balanced masonry columns
  const masonryData = useMemo(() => {
    const processedData = data.map((item) => ({
      ...item,
      foodImage: item.foodImage || "", // Empty string for SVG placeholder
    }));

    // Simple alternating distribution for clean masonry
    const leftColumn = processedData.filter((_, index) => index % 2 === 0);
    const rightColumn = processedData.filter((_, index) => index % 2 === 1);

    return [
      {
        id: "masonry-container",
        leftColumn,
        rightColumn,
        showLoader: isFetchingNextPage,
      },
    ];
  }, [data, isFetchingNextPage]);

  // Render column of items
  const renderColumn = useCallback(
    (columnData: LikeItem[]) => (
      <View style={styles.columnContainer}>
        {columnData.map((item) => (
          <View key={item.id} style={styles.cardContainer}>
            <MemoizedLikeCard
              item={item}
              onBucketPress={() => onBucketPress(item.id)}
              onPress={() => onItemPress?.(item)}
            />
          </View>
        ))}
      </View>
    ),
    [onBucketPress, onItemPress]
  );

  // Render the masonry container
  const renderMasonryContainer: ListRenderItem<MasonryContainer> = useCallback(
    ({ item }) => {
      // Determine justification based on column content
      const hasLeftColumn = item.leftColumn.length > 0;
      const hasRightColumn = item.rightColumn.length > 0;
      const justifyContent =
        hasLeftColumn && hasRightColumn ? "center" : "flex-start";

      return (
        <View>
          <View style={[styles.rowContainer, { justifyContent }]}>
            {renderColumn(item.leftColumn)}
            {renderColumn(item.rightColumn)}
          </View>
          {item.showLoader && (
            <View style={styles.footerLoader}>
              <AnimatedLoader />
            </View>
          )}
        </View>
      );
    },
    [renderColumn]
  );

  // Handle end reached for infinite pagination
  const handleEndReached = useCallback(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !loadingRef.current &&
      onLoadMore
    ) {
      loadingRef.current = true;
      onLoadMore();
      // Reset loading ref after a delay to prevent rapid calls
      setTimeout(() => {
        loadingRef.current = false;
      }, 1000);
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // Key extractor
  const keyExtractor = useCallback((item: MasonryContainer) => item.id, []);

  // Empty state
  if (data.length === 0 && !refreshing) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={masonryData}
        renderItem={renderMasonryContainer}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={showVerticalScrollIndicator}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        onScroll={onScroll}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={1} // Only 1 container
        windowSize={5} // Keep small window since we have 1 large item
        initialNumToRender={1} // Start with 1 container
        onEndReachedThreshold={0.3}
        onEndReached={handleEndReached}
        // Refresh control
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        // Disable scroll during refresh for better UX
        scrollEnabled={!refreshing}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: verticalScale(20),
  },
  rowContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: horizontalScale(10),
    alignItems: "flex-start" as const,
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  columnContainer: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: verticalScale(8),
  },
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: "center" as const,
  },
};

export default MasonryGrid;
