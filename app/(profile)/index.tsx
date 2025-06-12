import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import NavigationHeader from "@/components/Header/NavigationHeader";
import { useTheme } from "@/contexts/ThemeContext";
import CustomView from "@/components/CustomView";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import NextButton from "@/components/Button/NextButton";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import EditProfileSvg from "@/components/SvgComponents/EditProfileSvg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const UpdateProfile = () => {
  const { colors } = useTheme();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    home: "",
    personalSummary: "",
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
        home: user.home || "",
        personalSummary: user.personalSummary || "",
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // add the id to the form data
    updateUser(form, {
      onSuccess: () => {
        console.log("User updated successfully");
        router.back();
      },
      onError: (err: any) => {
        console.error("Error updating user:", err);
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <NavigationHeader header="Edit profile" />
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        scrollEnabled={true}
        bounces={false}
      >
        <CustomView style={styles.inputContainer}>
          {/* <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    user?.profileImageUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format",
                }}
                style={styles.profileImage}
              />
              <CustomTouchable
                bgColor={colors.overlay}
                style={styles.cameraContainer}
              >
                <EditProfileSvg />
              </CustomTouchable>
            </View> */}
          <CustomTextInput
            label="First name"
            placeholder="First name"
            value={form.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
          />

          <CustomTextInput
            label="Last name"
            placeholder="Last name"
            value={form.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
          />
          <CustomTextInput
            label="Email"
            placeholder="Email"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
          />

          <CustomTextInput
            label="Home"
            placeholder="Home"
            value={form.home}
            onChangeText={(text) => handleChange("home", text)}
          />
          <CustomTextInput
            label="Travel destination"
            placeholder="Travel destination"
            value={form.location}
            onChangeText={(text) => handleChange("location", text)}
          />
          <CustomTextInput
            multiline
            label="Personal summary"
            customTextStyles={styles.textArea}
            value={form.personalSummary}
            onChangeText={(text) => handleChange("personalSummary", text)}
            fixedHeight={77}
            placeholder="Tell us everything about yourself."
          />
          <NextButton
            onPress={handleSubmit}
            bgColor={colors.lime}
            customStyles={{ marginTop: "auto" }}
            title={isPending ? "Updating..." : "Update"}
            disabled={isPending}
          />
        </CustomView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputContainer: {
    marginTop: verticalScale(16),
    flex: 1,
    gap: verticalScale(12),
    paddingTop: verticalScale(6),
    paddingHorizontal: horizontalScale(24),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 360,
    marginBottom: verticalScale(12),
    alignSelf: "center",
  },
  avatarContainer: {
    position: "relative", // This is important to position the camera icon inside the avatar
  },
  cameraContainer: {
    position: "absolute",
    bottom: -4,
    right: "32%",
    padding: 10,
    borderRadius: 1000,
    zIndex: 10,
  },
  textArea: {
    fontSize: scaleFontSize(14),
  },
});

export default UpdateProfile;
