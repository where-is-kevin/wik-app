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
  runOnJS,
} from "react-native-reanimated";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import CustomView from "../CustomView";
import EditSvg from "../SvgComponents/EditSvg";
import HomeSvg from "../SvgComponents/HomeSvg";
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

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { userLocation } = useUserLocation();

  // Animation values
  const profileImageY = useSharedValue(-100);
  const profileImageOpacity = useSharedValue(0);
  const nameY = useSharedValue(-50);
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
      // Profile image animation
      profileImageY.value = withSpring(0, { damping: 15, stiffness: 100 });
      profileImageOpacity.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });

      // Name animation (delayed)
      nameY.value = withDelay(
        150,
        withSpring(0, { damping: 15, stiffness: 100 })
      );
      nameOpacity.value = withDelay(
        150,
        withSpring(1, { damping: 15, stiffness: 100 })
      );

      // Location tags animation (more delayed)
      locationY.value = withDelay(
        300,
        withSpring(0, { damping: 15, stiffness: 100 })
      );
      locationOpacity.value = withDelay(
        300,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
    }
  }, [user]);

  // Animated styles
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
          <CustomView bgColor={colors.gray_regular} style={styles.profileImage}>
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
            bgColor={colors.profile_name_black}
            style={styles.locationTag}
          >
            <LocationSvg />
            <CustomText
              fontFamily="Inter-Medium"
              style={[styles.locationText, { color: colors.text_white }]}
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
};

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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 44,
    marginRight: horizontalScale(6),
  },
  locationText: {
    marginLeft: horizontalScale(6),
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
