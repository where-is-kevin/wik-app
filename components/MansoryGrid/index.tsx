import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import CustomView from "@/components/CustomView";
import LikeCard from "@/components/LikeComponent/LikeCard";
import { horizontalScale } from "@/utilities/scaling";

// Interface for like items
interface LikeItem {
  id: string;
  title: string;
  foodImage: string;
  landscapeImage: string;
  isExperience?: boolean;
  hasIcon?: boolean;
  height?: "short" | "tall";
}

interface MasonryGridProps {
  data: LikeItem[];
  onBucketPress: () => void;
  onItemPress?: (item: LikeItem) => void;
  showVerticalScrollIndicator?: boolean;
  contentContainerStyle?: object;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  data,
  onBucketPress,
  onItemPress = (item) => console.log("Like card pressed:", item.id),
  showVerticalScrollIndicator = false,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
}) => {
  // Split data into two columns for masonry effect
  const leftColumn = data.filter((_, index) => index % 2 === 0);
  const rightColumn = data.filter((_, index) => index % 2 === 1);

  const renderColumn = (columnData: LikeItem[]) => (
    <CustomView style={{ flex: 1 }}>
      {columnData.map((item) => (
        <CustomView key={item.id} style={{ marginBottom: 0 }}>
          <LikeCard
            onBucketPress={onBucketPress}
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
            tintColor="#666" // Color of the refresh indicator (iOS)
            colors={["#666"]} // Colors of the refresh indicator (Android)
          />
        ) : undefined
      }
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
