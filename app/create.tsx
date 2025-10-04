import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import NextButton from "@/components/Button/NextButton";
import CreateContentAddImageSvg from "@/components/SvgComponents/CreateContentAddImageSvg";
import { CustomDropdownCreate } from "@/components/Dropdown/CustomDropdownCreate";
import { TypeSelectionModal, TypeSelectionModalRef } from "@/components/Modals/TypeSelectionModal";
import { BusinessLeisureModal, BusinessLeisureModalRef } from "@/components/Modals/BusinessLeisureModal";
import {
  CreateEventForm,
  EventFormData,
} from "@/components/Forms/CreateEventForm";
import {
  CreateExperienceForm,
  ExperienceFormData,
} from "@/components/Forms/CreateExperienceForm";
import * as ImagePicker from "expo-image-picker";

export default function CreateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [eventType, setEventType] = useState("Event");
  const [businessLeisureOptions, setBusinessLeisureOptions] = useState<
    string[]
  >(["Business"]);
  const [images, setImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const typeModalRef = useRef<TypeSelectionModalRef>(null);
  const businessLeisureModalRef = useRef<BusinessLeisureModalRef>(null);
  // Form data states
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    eventName: "",
    startDate: new Date(),
    endDate: new Date(),
    venue: "",
    description: "",
    industry: "",
    tags: "",
    bookingLink: "",
    price: "",
    capacity: "",
  });
  const [experienceFormData, setExperienceFormData] =
    useState<ExperienceFormData>({
      experienceName: "",
      venue: "",
      description: "",
      industry: "",
      tags: "",
      bookingLink: "",
      price: "",
      capacity: "",
    });

  const safeDismiss = useCallback(() => {
    try {
      // Use router.dismiss() for modals or router.back() with fallback
      if (router.canDismiss()) {
        router.dismiss();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback: navigate to main route
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.warn('Navigation error:', error);
      // Last resort: try to replace with main route
      router.replace('/(tabs)/');
    }
  }, [router]);

  const handleCreateEvent = useCallback(() => {
    // Handle event creation
    console.log("Creating event:", {
      eventType,
      businessLeisureOptions,
      eventFormData,
      experienceFormData,
    });
    safeDismiss();
  }, [
    eventType,
    businessLeisureOptions,
    eventFormData,
    experienceFormData,
    safeDismiss,
  ]);

  const handleImageUpload = useCallback(
    async (index: number) => {
      // Request permission to access the media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = [...images];

        // If this is the first image being uploaded, always put it in index 0 (main position)
        const hasAnyImages = images.some((img) => img !== null);
        if (!hasAnyImages) {
          newImages[0] = result.assets[0].uri;
        } else {
          // For subsequent images, put them in the requested index
          newImages[index] = result.assets[0].uri;
        }

        setImages(newImages);
      }
    },
    [images]
  );

  const handleImageSwitch = useCallback(
    (clickedIndex: number) => {
      if (images[clickedIndex] && clickedIndex !== 0) {
        const newImages = [...images];
        // Swap the clicked image with the main image
        const temp = newImages[0];
        newImages[0] = newImages[clickedIndex];
        newImages[clickedIndex] = temp;
        setImages(newImages);
      }
    },
    [images]
  );

  const handleTypeSelect = useCallback((type: string) => {
    setEventType(type);
  }, []);

  const handleBusinessLeisureSelect = useCallback((selections: string[]) => {
    setBusinessLeisureOptions(selections);
  }, []);

  const [scrollOffset, setScrollOffset] = useState(0);

  const handleGestureEvent = useCallback((event: any) => {
    // Only allow pull-to-dismiss when at the top of the scroll view
    const { translationY, velocityY } = event.nativeEvent;
    if (scrollOffset <= 0 && translationY > 100 && velocityY > 500) {
      safeDismiss();
    }
  }, [safeDismiss, scrollOffset]);

  const handleGestureStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      // Only dismiss if at top of scroll view and pulled down enough
      if (scrollOffset <= 0 && (translationY > 150 || (translationY > 50 && velocityY > 800))) {
        safeDismiss();
      }
    }
  }, [safeDismiss, scrollOffset]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    setScrollOffset(contentOffset.y);
  }, []);

  const getBusinessLeisureDisplayText = () => {
    if (businessLeisureOptions.length === 0) return "Select...";
    if (businessLeisureOptions.length === 1) return businessLeisureOptions[0];
    return "Both";
  };

  return (
    <View style={styles.wrapper}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        minPointers={1}
        maxPointers={1}
        enabled={scrollOffset <= 0}
      >
        <View style={[styles.container]}>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#6A0C31" />

            {/* Drag Handle - Fixed */}
            <TouchableOpacity
              style={styles.handleContainer}
              onPress={safeDismiss}
              activeOpacity={0.7}
            >
              <View style={[styles.handle]} />
            </TouchableOpacity>

            <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom:
                  Math.max(insets.bottom, verticalScale(20)) +
                  verticalScale(20),
              },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
            scrollEventThrottle={16}
            simultaneousHandlers={[]}
            onScroll={handleScroll}
          >
            {/* Title */}
            <View style={styles.header}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.headerTitle, { color: colors.onboarding_gray }]}
              >
                Create Suggestion
              </CustomText>
            </View>

            {/* Image Upload Section */}
            <View style={styles.imageSection}>
              {/* Main Image */}
              <TouchableOpacity
                style={styles.mainImageContainer}
                onPress={() => handleImageUpload(0)}
                activeOpacity={0.7}
              >
                {images[0] ? (
                  <Image
                    source={{ uri: images[0] }}
                    style={styles.imageStyle}
                  />
                ) : (
                  <CreateContentAddImageSvg width={60} height={60} />
                )}
              </TouchableOpacity>

              {/* Side Images */}
              <View style={styles.sideImagesContainer}>
                {[1, 2, 3].map((index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sideImage,
                      images[index] && { backgroundColor: "#FFFFFF" },
                    ]}
                    onPress={() =>
                      images[index]
                        ? handleImageSwitch(index)
                        : handleImageUpload(index)
                    }
                    activeOpacity={0.7}
                  >
                    {images[index] && (
                      <Image
                        source={{ uri: images[index] }}
                        style={styles.sideImageStyle}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* General Section */}
            <CustomText
              style={[styles.sectionTitle, { color: colors.input_border }]}
            >
              General
            </CustomText>

            {/* Type Dropdown */}
            <CustomDropdownCreate
              label="Type"
              value={eventType}
              onPress={() => typeModalRef.current?.present()}
              iconType="type"
            />

            {/* Business or Leisure Dropdown */}
            <CustomDropdownCreate
              label="Business or Leisure?"
              value={getBusinessLeisureDisplayText()}
              onPress={() => businessLeisureModalRef.current?.present()}
              iconType="userType"
            />

            {/* Details Section - Show form based on selected type */}
            {eventType === "Event" && (
              <View style={styles.detailsSection}>
                <CustomText
                  style={[styles.sectionTitle, { color: colors.input_border }]}
                >
                  Event Details
                </CustomText>
                <CreateEventForm
                  formData={eventFormData}
                  onFormChange={setEventFormData}
                />
              </View>
            )}

            {eventType === "Experience" && (
              <View style={styles.detailsSection}>
                <CustomText
                  style={[styles.sectionTitle, { color: colors.input_border }]}
                >
                  Experience Details
                </CustomText>
                <CreateExperienceForm
                  formData={experienceFormData}
                  onFormChange={setExperienceFormData}
                />
              </View>
            )}

            {/* Create Button */}
            <View style={[styles.createButtonContainer, { marginTop: verticalScale(20) }]}>
              <NextButton
                title="Create Event"
                onPress={handleCreateEvent}
                bgColor={colors.lime}
                customTextStyle={{ fontSize: scaleFontSize(16) }}
              />
            </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </PanGestureHandler>

      {/* Type Selection Modal */}
      <TypeSelectionModal
        ref={typeModalRef}
        onSelect={handleTypeSelect}
        selectedType={eventType}
      />

      {/* Business or Leisure Modal */}
      <BusinessLeisureModal
        ref={businessLeisureModalRef}
        onSelect={handleBusinessLeisureSelect}
        selectedOptions={businessLeisureOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    backgroundColor: "#6A0C31",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden", // This prevents white corners
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  handle: {
    width: 80,
    height: 6,
    borderRadius: 5.641,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  header: {
    alignItems: "center",
    paddingTop: verticalScale(7), // This will add to the 15px total spacing from handle
    marginBottom: verticalScale(28), // 30px space between title and image section
  },
  headerTitle: {
    fontSize: scaleFontSize(16),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    flexGrow: 1,
  },
  imageSection: {
    flexDirection: "row",
    marginBottom: verticalScale(28),
    gap: horizontalScale(10),
    alignItems: "flex-start",
    alignSelf: "center",
  },
  mainImageContainer: {
    width: 221,
    height: 221,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  sideImagesContainer: {
    width: 67,
    height: 221,
    justifyContent: "space-between",
  },
  sideImage: {
    width: 67,
    height: 67,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(15),
    color: "#FFFFFF",
  },
  createButtonContainer: {
    marginTop: "auto",
    paddingBottom: verticalScale(20),
  },
  imageStyle: {
    width: 221,
    height: 221,
    borderRadius: 20,
  },
  sideImageStyle: {
    width: 67,
    height: 67,
    borderRadius: 12,
  },
  detailsSection: {
    marginTop: verticalScale(24),
  },
});
