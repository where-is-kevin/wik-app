import React from "react";
import { StyleSheet, FlatList, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { MajorEventsCard, MajorEventData } from "../Cards/MajorEventsCard";
import { EventTypeDropdown, EventType } from "../Dropdown/EventTypeDropdown";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface MajorEventsSectionProps {
  events: MajorEventData[];
  selectedEventType?: EventType;
  onEventTypeChange?: (type: EventType) => void;
  onEventPress: (event: MajorEventData) => void;
  onLikePress?: (event: MajorEventData) => void;
  location?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export const MajorEventsSection: React.FC<MajorEventsSectionProps> = ({
  events,
  selectedEventType = "worldwide",
  onEventTypeChange,
  onEventPress,
  onLikePress,
  location = "Lisbon",
  isLoading = false,
  isSuccess = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleViewAllPress = () => {
    // Navigate to appropriate business events screen based on selected event type
    if (selectedEventType === "worldwide") {
      router.push("/worldwide-business-events");
    } else {
      router.push("/major-events-nearby");
    }
  };

  const renderEventCard = ({ item }: { item: MajorEventData }) => (
    <MajorEventsCard
      event={item}
      onPress={onEventPress}
      onLikePress={onLikePress}
    />
  );

  // Always show the section so users can change filters even with no data

  return (
    <CustomView style={styles.container}>
      {/* Section header */}
      <CustomView style={styles.headerContainer}>
        <CustomView style={styles.headerTextContainer}>
          <EventTypeDropdown
            selectedType={selectedEventType}
            onTypeChange={onEventTypeChange || (() => {})}
            location={location}
          />
        </CustomView>

        {events.length > 0 && (
          <TouchableOpacity onPress={handleViewAllPress} activeOpacity={0.7}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.viewAllText, { color: colors.light_blue }]}
            >
              View all
            </CustomText>
          </TouchableOpacity>
        )}
      </CustomView>

      {/* Horizontal scrolling events, loading state, or no data message */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <AnimatedLoader customAnimationStyle={{ width: 80, height: 80 }} />
          </View>
        ) : events.length > 0 ? (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            style={styles.flatList}
          />
        ) : isSuccess ? (
          <View style={styles.noDataContainer}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.noDataText,
                { color: colors.onboarding_option_dark },
              ]}
            >
              No data available
            </CustomText>
            <CustomText
              style={[styles.noDataSubtext, { color: colors.event_gray }]}
            >
              Change filter to see events
            </CustomText>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <AnimatedLoader customAnimationStyle={{ width: 80, height: 80 }} />
          </View>
        )}
      </View>
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
  contentContainer: {
    height: verticalScale(120), // Match the height of MajorEventsCard
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(4),
  },
  noDataSubtext: {
    fontSize: scaleFontSize(14),
  },
});
