import React from "react";
import {
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import CustomView from "@/components/CustomView";
import LikeCard from "@/components/LikeComponent/LikeCard";
import { horizontalScale } from "@/utilities/scaling";

// Interface for like items
interface LikeItem {
  id: string;
  title: string;
  foodImage: string | any;
  landscapeImage: string;
  hasIcon?: boolean;
  height?: "short" | "tall";
  category: string;
}

interface MasonryGridProps {
  data: LikeItem[];
  onBucketPress: (likeItemId: string) => void;
  onItemPress?: (item: LikeItem) => void;
  showVerticalScrollIndicator?: boolean;
  contentContainerStyle?: object;
  refreshing?: boolean;
  onRefresh?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;
  scrollEventThrottle?: number;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  data,
  onBucketPress,
  onItemPress = (item) => console.log("Like card pressed:", item.id),
  showVerticalScrollIndicator = false,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  onScroll,
  onMomentumScrollEnd,
  scrollEventThrottle = 16,
}) => {
  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Process data to ensure all items have valid images
  const processedData = data.map((item) => ({
    ...item,
    foodImage: item.foodImage || PLACEHOLDER_IMAGE,
  }));

  // Split data into two columns for masonry effect
  const leftColumn = processedData.filter((_, index) => index % 2 === 0);
  const rightColumn = processedData.filter((_, index) => index % 2 === 1);

  const renderColumn = (columnData: LikeItem[]) => (
    <CustomView style={{ flex: 1 }}>
      {columnData.map((item) => (
        <CustomView key={item.id} style={{ marginBottom: 0 }}>
          <LikeCard
            onBucketPress={() => onBucketPress(item.id)}
            item={item}
            onPress={() => onItemPress(item)}
          />
        </CustomView>
      ))}
    </CustomView>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={showVerticalScrollIndicator}
      contentContainerStyle={[
        {
          paddingHorizontal: horizontalScale(16),
        },
        contentContainerStyle,
      ]}
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
      onScroll={onScroll}
      onMomentumScrollEnd={onMomentumScrollEnd}
      scrollEventThrottle={scrollEventThrottle}
    >
      <CustomView
        style={{
          flexDirection: "row",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {renderColumn(leftColumn)}
        {renderColumn(rightColumn)}
      </CustomView>
    </ScrollView>
  );
};

export default MasonryGrid;
export type { LikeItem, MasonryGridProps };
