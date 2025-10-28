import { useTheme } from "@/contexts/ThemeContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import CustomView from "../CustomView";
import EditSvg from "../SvgComponents/EditSvg";
import LocationSvg from "../SvgComponents/LocationSvg";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import React from "react";

type ProfileSectionProps = {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    personalSummary?: string;
    location?: string;
    home?: string;
  };
};

const ProfileSection: React.FC<ProfileSectionProps> = React.memo(
  ({ user }: ProfileSectionProps) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useTheme();
    const { userLocation } = useUserLocation();

    // Animation values - balanced starting positions for visible spring effect
    const profileImageY = useSharedValue(-60);
    const profileImageOpacity = useSharedValue(0);
    const nameY = useSharedValue(-40);
    const nameOpacity = useSharedValue(0);
    const locationY = useSharedValue(-30);
    const locationOpacity = useSharedValue(0);

    const onEditPress = () => {
      router.push("/(profile)");
    };

    const onLocationPress = () => {
      router.push("/location-selection");
    };

    // Helper function to get valid image URL
    const getValidImageUrl = (imageUrl?: string): string | null => {
      if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
        return imageUrl;
      }
      return null;
    };

    // Get safe profile image source
    const validProfileImageUrl = getValidImageUrl(user?.profileImage);

    // Start animations when user data is available
    React.useEffect(() => {
      if (user) {
        // Bouncy spring configuration - smooth but with visible spring effect
        const bouncySpringConfig = {
          damping: 12,
          stiffness: 120,
          mass: 0.9,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.1,
        };

        // Add initial delay to prevent laggy animations during screen load
        const initialDelay = 300; // 300ms delay to let the screen render first

        // Bouncy spring animations with staggered timing
        profileImageY.value = withDelay(
          initialDelay,
          withSpring(0, bouncySpringConfig)
        );
        profileImageOpacity.value = withDelay(
          initialDelay,
          withSpring(1, bouncySpringConfig)
        );

        // Staggered animations with longer delays
        nameY.value = withDelay(
          initialDelay + 80,
          withSpring(0, bouncySpringConfig)
        );
        nameOpacity.value = withDelay(
          initialDelay + 80,
          withSpring(1, bouncySpringConfig)
        );

        locationY.value = withDelay(
          initialDelay + 160,
          withSpring(0, bouncySpringConfig)
        );
        locationOpacity.value = withDelay(
          initialDelay + 160,
          withSpring(1, bouncySpringConfig)
        );
      } else {
        // Reset animation values when user is null
        profileImageY.value = -60;
        profileImageOpacity.value = 0;
        nameY.value = -40;
        nameOpacity.value = 0;
        locationY.value = -30;
        locationOpacity.value = 0;
      }
    }, [
      user,
      profileImageY,
      profileImageOpacity,
      nameY,
      nameOpacity,
      locationY,
      locationOpacity,
    ]);

    // Animated styles - optimized for better performance
    const profileImageStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: profileImageY.value }],
      opacity: profileImageOpacity.value,
    }));

    const nameStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: nameY.value }],
      opacity: nameOpacity.value,
      alignItems: "center",
      width: "100%",
    }));

    const locationStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: locationY.value }],
      opacity: locationOpacity.value,
      width: "100%",
    }));

    return (
      <CustomView
        bgColor={colors.onboarding_gray}
        style={[
          styles.profileHeader,
          { paddingTop: insets.top + verticalScale(12) },
        ]}
      >
        {/* Profile Image */}
        <Animated.View style={profileImageStyle}>
          {validProfileImageUrl ? (
            <CustomView
              bgColor={colors.gray_regular}
              style={styles.profileImage}
            >
              <OptimizedImage
                source={{ uri: validProfileImageUrl }}
                style={styles.profileImage}
                contentFit="cover"
                priority="high"
                showLoadingIndicator={false}
              />
            </CustomView>
          ) : (
            <CustomView
              bgColor={colors.border_gray}
              style={styles.profileImage}
            />
          )}
        </Animated.View>

        {/* Name and Edit Icon */}
        <Animated.View style={nameStyle}>
          <CustomView
            bgColor={colors.onboarding_gray}
            style={styles.nameContainer}
          >
            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.profileName, { color: colors.profile_name_black }]}
            >
              {user?.firstName || "Placeholder Name"}
            </CustomText>
            <CustomTouchable
              onPress={onEditPress}
              bgColor={colors.onboarding_gray}
            >
              <EditSvg />
            </CustomTouchable>
          </CustomView>
          {user?.personalSummary && (
            <CustomText
              style={[styles.profileBio, { color: colors.profile_name_black }]}
            >
              {user?.personalSummary || ""}
            </CustomText>
          )}
        </Animated.View>

        {/* Location Tags */}
        <Animated.View style={locationStyle}>
          <CustomView
            bgColor={colors.onboarding_gray}
            style={[
              styles.locationContainer,
              !user?.personalSummary && { marginTop: verticalScale(10) },
            ]}
          >
            <CustomTouchable
              onPress={onLocationPress}
              bgColor={colors.lime}
              style={styles.locationTag}
            >
              <LocationSvg color={colors.label_dark} />
              <CustomText
                style={[styles.locationText, { color: colors.label_dark }]}
              >
                {userLocation?.displayName || "Current Location"}
              </CustomText>
            </CustomTouchable>

            {/* <CustomView
            bgColor={colors.opacity_lime}
            style={styles.secondaryLocationTag}
          >
            <HomeSvg />
            <CustomText
              fontFamily="Inter-Medium"
              style={[
                styles.locationText,
                { color: colors.profile_name_black },
              ]}
            >
              {user?.home || "No location"}
            </CustomText>
          </CustomView> */}
          </CustomView>
        </Animated.View>
      </CustomView>
    );
  }
);

ProfileSection.displayName = "ProfileSection";

export default ProfileSection;

const styles = StyleSheet.create({
  profileHeader: {
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: verticalScale(24),
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Half of width/height for perfect circle
    marginBottom: verticalScale(12),
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  profileName: {
    fontSize: scaleFontSize(22),
    marginRight: horizontalScale(10),
    textTransform: "capitalize",
  },
  profileBio: {
    textAlign: "center",
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(12),
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    borderRadius: 100,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4, // For Android shadow
  },
  locationText: {
    fontSize: scaleFontSize(12),
  },
  secondaryLocationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 44,
  },
});
