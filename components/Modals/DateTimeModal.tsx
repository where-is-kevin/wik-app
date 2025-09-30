import React from "react";
import { View, StyleSheet } from "react-native";
import { CreateModal } from "@/components/Modals/CreateModal";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import DateTimePicker from "@react-native-community/datetimepicker";
import NextButton from "@/components/Button/NextButton";

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
  const [selectedDate, setSelectedDate] = React.useState(initialDate);

  React.useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate, visible]);

  const handleContinue = () => {
    onSave(selectedDate);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDate(initialDate);
    onClose();
  };

  const onDateChange = (_: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <CreateModal
      visible={visible}
      title={title}
      onClose={onClose}
      showCancelButton={true}
      onCancel={handleCancel}
    >
      <View style={styles.content}>
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="spinner"
            onChange={onDateChange}
            minimumDate={minimumDate}
            style={styles.picker}
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <NextButton
            title="Continue"
            onPress={handleContinue}
            bgColor={colors.lime}
            customTextStyle={{ fontSize: scaleFontSize(16) }}
          />
        </View>
      </View>
    </CreateModal>
  );
};

const styles = StyleSheet.create({
  content: {},
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    transform: [{ scaleX: 0.92 }, { scaleY: 0.92 }],
  },
  buttonContainer: {},
});
