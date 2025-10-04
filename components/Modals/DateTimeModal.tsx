import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import NextButton from "@/components/Button/NextButton";
import CustomText from "@/components/CustomText";

interface DateTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (date: Date) => void;
  initialDate: Date;
  title: string;
  minimumDate?: Date;
}

export const DateTimeModal: React.FC<DateTimeModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
  title,
  minimumDate,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [date, setDate] = React.useState(initialDate);

  React.useEffect(() => {
    setDate(initialDate);

    // For Android, use the imperative API with date then time picker
    if (Platform.OS === 'android' && visible) {
      // First show date picker
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        display: 'default',
        minimumDate: minimumDate,
        positiveButton: {
          label: 'Next',
          textColor: '#6A0C31'
        },
        negativeButton: {
          label: 'Cancel',
          textColor: '#6A0C31'
        },
        onChange: (event: any, selectedDate?: Date) => {
          if (event.type === 'dismissed') {
            onClose();
            return;
          }

          if (event.type === 'set' && selectedDate) {
            // Date selected, now show time picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              display: 'default',
              is24Hour: false,
              positiveButton: {
                label: 'Continue',
                textColor: '#6A0C31'
              },
              negativeButton: {
                label: 'Cancel',
                textColor: '#6A0C31'
              },
              onChange: (timeEvent: any, selectedTime?: Date) => {
                if (timeEvent.type === 'dismissed') {
                  onClose();
                  return;
                }

                if (timeEvent.type === 'set' && selectedTime) {
                  // Combine date and time
                  const finalDateTime = new Date(selectedDate);
                  finalDateTime.setHours(selectedTime.getHours());
                  finalDateTime.setMinutes(selectedTime.getMinutes());

                  setDate(finalDateTime);
                  onSave(finalDateTime);
                  onClose();
                }
              }
            });
          }
        }
      });
    }
  }, [visible, initialDate, minimumDate, onSave, onClose]);

  const handleContinue = () => {
    onSave(date);
    onClose();
  };

  const handleCancel = () => {
    setDate(initialDate);
    onClose();
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // For iOS, show custom modal with inline picker
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        transparent={true}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.titleText, { color: colors.label_dark }]}
                >
                  {title}
                </CustomText>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                >
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.cancelText, { color: colors.light_blue}]}
                  >
                    Cancel
                  </CustomText>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="datetime"
                    display="spinner"
                    onChange={onChange}
                    minimumDate={minimumDate}
                    style={styles.picker}
                    textColor={colors.label_dark}
                    themeVariant="light"
                  />
                </View>

                {/* Continue Button */}
                <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
                  <NextButton
                    title="Continue"
                    onPress={handleContinue}
                    bgColor={colors.lime}
                    customTextStyle={{ fontSize: scaleFontSize(16) }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // For Android, the imperative API handles everything - return null
  return null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    // Height determined by content
  },
  modalContent: {
    backgroundColor: "#FFFFFF", // White background for iOS
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  titleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  cancelButton: {},
  cancelText: {
    fontSize: scaleFontSize(16),
  },
  content: {
    // paddingBottom: verticalScale(10),
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: 200,
  },
  buttonContainer: {
    // marginTop: verticalScale(20),
  },
});
