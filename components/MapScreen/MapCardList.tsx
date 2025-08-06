import React from "react";
import { View, Dimensions, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import ContentCard from "@/components/ContentCard";

interface MapCardListProps {
  data: any[];
  selectedIndex: number;
  onScrollEnd: (event: any) => void;
  onCardPress: (item: any) => void;
  onBucketPress?: (itemId: string) => void;
  flatListRef: React.RefObject<FlatList>;
}

const MapCardList: React.FC<MapCardListProps> = ({
  data,
  selectedIndex,
  onScrollEnd,
  onCardPress,
  onBucketPress,
  flatListRef,
}) => {
  const insets = useSafeAreaInsets();
  const CARD_WIDTH = Dimensions.get("window").width * 0.85; // Keep original percentage width
  const CARD_SPACING = 12;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

  const renderEventCard = ({ item, index }: { item: any; index: number }) => {
    const isSelected = index === selectedIndex;

    return (
      <ContentCard
        item={item}
        width={CARD_WIDTH}
        isSelected={isSelected}
        onPress={onCardPress}
        onBucketPress={onBucketPress}
      />
    );
  };

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{
          paddingLeft: (Dimensions.get("window").width - CARD_WIDTH) / 2,
          paddingRight: (Dimensions.get("window").width - CARD_WIDTH) / 2,
        }}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 220,
  },
  separator: {
    width: 12,
  },
});

export default MapCardList;