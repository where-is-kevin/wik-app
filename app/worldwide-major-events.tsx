import React, { useState } from "react";
import { StyleSheet, View, StatusBar, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { verticalScale } from "@/utilities/scaling";
import { MajorEventData } from "@/components/Cards/MajorEventsCard";
import { HeaderWithIcons } from "@/components/Header/HeaderWithIcons";
import { EventsList } from "@/components/List/EventsList";
import FloatingMapButton from "@/components/FloatingMapButton";

const WorldwideMajorEventsScreen: React.FC = () => {
  const router = useRouter();

  // Mock worldwide major events data
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([
    {
      id: "1",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: true,
    },
    {
      id: "2",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: true,
    },
    {
      id: "3",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "4",
      title: "TechCrunch Disrupt",
      location: "San Francisco",
      dateRange: "October 28 - 30, 2025",
      eventCount: "50+ Events",
      imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6",
      isLiked: false,
    },
    {
      id: "5",
      title: "CES 2026",
      location: "Las Vegas",
      dateRange: "January 7 - 10, 2026",
      eventCount: "200+ Events",
      imageUrl: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
      isLiked: true,
    },
  ]);

  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (event: MajorEventData) => {
    router.push(`/business-events/${event.id}`);
  };

  const handleLikePress = (event: MajorEventData) => {
    setMajorEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
  };

  const handleMapPress = () => {
    // TODO: Navigate to map screen
    console.log("Map button pressed");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header */}
      <HeaderWithIcons
        title="Major events"
        subtitle="Worldwide"
        onBackPress={handleBackPress}
        showMapIcon={false}
        showSearchIcon={true}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EventsList
          events={majorEvents}
          onEventPress={handleEventPress}
          onLikePress={handleLikePress}
          cardHeight={verticalScale(100)}
          gap={verticalScale(10)}
        />
      </ScrollView>

      {/* Floating Map Button - Only show if there are events available */}
      {majorEvents.length > 0 && (
        <FloatingMapButton onPress={handleMapPress} hasTabBar={false} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: verticalScale(110),
    paddingTop: verticalScale(20),
  },
});

export default WorldwideMajorEventsScreen;
