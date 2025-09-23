import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  MajorEventsCard,
  MajorEventData,
} from "@/components/Cards/MajorEventsCard";
import {
  horizontalScale,
  verticalScale,
} from "@/utilities/scaling";

interface EventsListProps {
  events: MajorEventData[];
  onEventPress: (event: MajorEventData) => void;
  onLikePress?: (event: MajorEventData) => void;
  cardHeight?: number;
  gap?: number;
  horizontal?: boolean;
  showsScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  onEventPress,
  onLikePress,
  cardHeight = verticalScale(100),
  gap = verticalScale(10),
  horizontal = false,
  showsScrollIndicator = false,
  contentContainerStyle,
  style,
}) => {
  const containerStyle = [
    styles.container,
    horizontal ? styles.horizontalContainer : styles.verticalContainer,
    { gap },
    style,
  ];

  const renderEventCard = (event: MajorEventData, index: number) => (
    <MajorEventsCard
      key={event.id}
      event={event}
      onPress={onEventPress}
      onLikePress={onLikePress}
      style={[
        styles.eventCard,
        { height: cardHeight },
        horizontal && styles.horizontalCard,
      ]}
    />
  );

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={showsScrollIndicator}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        style={style}
      >
        <View style={containerStyle}>
          {events.map((event, index) => renderEventCard(event, index))}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
      {events.map((event, index) => renderEventCard(event, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(24),
  },
  verticalContainer: {
    flexDirection: "column",
  },
  horizontalContainer: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
  },
  eventCard: {
    width: "100%",
  },
  horizontalCard: {
    width: horizontalScale(280),
    marginRight: horizontalScale(16),
  },
});