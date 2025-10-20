import React, { useState } from "react";
import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { MajorEventsCard, MajorEventData } from "../Cards/MajorEventsCard";
import { EventTypeDropdown, EventType } from "../Dropdown/EventTypeDropdown";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface MajorEventsSectionProps {
  events: MajorEventData[];
  worldwideEvents?: MajorEventData[];
  onEventPress: (event: MajorEventData) => void;
  onLikePress?: (event: MajorEventData) => void;
  onViewAllPress: () => void;
  location?: string;
}

export const MajorEventsSection: React.FC<MajorEventsSectionProps> = ({
  events,
  worldwideEvents,
  onEventPress,
  onLikePress,
  onViewAllPress,
  location = "Lisbon",
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedEventType, setSelectedEventType] = useState<EventType>("nearby");

  const handleViewAllPress = () => {
    // Navigate to appropriate business events screen based on selected event type
    if (selectedEventType === "worldwide") {
      router.push('/worldwide-business-events');
    } else {
      router.push('/major-events-nearby');
    }
  };

  const renderEventCard = ({ item }: { item: MajorEventData }) => (
    <MajorEventsCard
      event={item}
      onPress={onEventPress}
      onLikePress={onLikePress}
    />
  );

  const displayEvents = selectedEventType === "worldwide" && worldwideEvents
    ? worldwideEvents
    : events;

  if (!displayEvents || displayEvents.length === 0) {
    return null;
  }

  return (
    <CustomView style={styles.container}>
      {/* Section header */}
      <CustomView style={styles.headerContainer}>
        <CustomView style={styles.headerTextContainer}>
          <EventTypeDropdown
            selectedType={selectedEventType}
            onTypeChange={setSelectedEventType}
            location={location}
          />
        </CustomView>

        <TouchableOpacity onPress={handleViewAllPress} activeOpacity={0.7}>
          <CustomText
            style={[styles.viewAllText, { color: colors.light_blue }]}
          >
            View all
          </CustomText>
        </TouchableOpacity>
      </CustomView>

      {/* Horizontal scrolling events */}
      <FlatList
        data={displayEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList}
      />
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(10),
  },
  headerTextContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(4),
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
  },
  viewAllText: {
    fontSize: scaleFontSize(14),
  },
  flatList: {
    paddingLeft: horizontalScale(20),
  },
  listContainer: {
    paddingRight: horizontalScale(20),
  },
});
