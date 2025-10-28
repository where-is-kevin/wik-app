import React, { useState, useCallback, useEffect } from "react";
import CustomTextInput from "../TextInput/CustomTextInput";

interface BucketNameInputProps {
  onTextChange: (text: string) => void;
  disabled: boolean;
}

// Performance-optimized input using CustomTextInput with controlled local state
const BucketNameInput: React.FC<BucketNameInputProps> = ({
  onTextChange,
  disabled
}) => {
  // Local state for the input - doesn't affect parent
  const [localValue, setLocalValue] = useState("");

  const handleChange = useCallback((text: string) => {
    setLocalValue(text); // Update local display
    onTextChange(text);  // Notify parent via ref
  }, [onTextChange]);

  // Reset local state when disabled changes (bucket created)
  useEffect(() => {
    if (disabled) {
      setLocalValue("");
    }
  }, [disabled]);

  return (
    <CustomTextInput
      label="Name"
      value={localValue}
      onChangeText={handleChange}
      placeholder="Enter bucket name..."
      autoCapitalize="words"
      editable={!disabled}
      autoFocus={true}
      returnKeyType="done"
    />
  );
};

export default React.memo(BucketNameInput);