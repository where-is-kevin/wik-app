import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Text,
} from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingSearch } from "./OnboardingSearch";
import { OnboardingBlurModal } from "./OnboardingModal";

interface CompanyData {
  id: string;
  name: string;
  icon: string;
}

const DEFAULT_COMPANIES: CompanyData[] = [
  { id: "where-is-kevin", name: "Where is Kevin?", icon: "🗺️" },
  { id: "apple", name: "Apple", icon: "🏢" },
  { id: "google", name: "Google", icon: "🏢" },
  { id: "microsoft", name: "Microsoft", icon: "🏢" },
  { id: "meta", name: "Meta", icon: "🏢" },
  { id: "amazon", name: "Amazon", icon: "🏢" },
  { id: "tesla", name: "Tesla", icon: "🏢" },
  { id: "netflix", name: "Netflix", icon: "🏢" },
  { id: "uber", name: "Uber", icon: "🏢" },
  { id: "airbnb", name: "Airbnb", icon: "🏢" },
];

interface OnboardingCompanyItemProps {
  company: CompanyData;
  onPress: (company: CompanyData) => void;
  searchTerm?: string;
}

const OnboardingCompanyItem: React.FC<OnboardingCompanyItemProps> = ({
  company,
  onPress,
  searchTerm,
}) => {
  const { colors } = useTheme();

  const renderHighlightedText = () => {
    if (!searchTerm || searchTerm.length === 0) {
      return (
        <CustomText
          style={[styles.companyText, { color: colors.label_dark }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {company.name}
        </CustomText>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = company.name.split(regex);

    return (
      <Text
        style={[styles.companyText, { color: colors.label_dark }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {parts.map((part, index) => {
          const isHighlight = regex.test(part);
          return (
            <CustomText
              fontFamily={isHighlight ? "Inter-Bold" : "Inter-Regular"}
              key={index}
            >
              {part}
            </CustomText>
          );
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.companyContainer]}
      onPress={() => onPress(company)}
      activeOpacity={0.7}
    >
      <CustomText style={styles.companyIcon}>{company.icon}</CustomText>
      <CustomView style={styles.companyTextContainer}>
        {renderHighlightedText()}
      </CustomView>
    </TouchableOpacity>
  );
};

interface OnboardingCompanyModalProps {
  visible: boolean;
  onClose: () => void;
  onCompanySelect: (company: string) => void;
  selectedCompany?: string;
}

export const OnboardingCompanyModal: React.FC<OnboardingCompanyModalProps> = ({
  visible,
  onClose,
  onCompanySelect,
  selectedCompany,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = DEFAULT_COMPANIES.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing companies and is not empty
  const hasCustomOption = searchQuery.trim().length > 0 && 
    !DEFAULT_COMPANIES.some(company => company.name.toLowerCase() === searchQuery.toLowerCase().trim());

  const handleCompanyPress = (company: CompanyData) => {
    onCompanySelect(company.name);
    setSearchQuery("");
    Keyboard.dismiss();
    onClose();
  };

  const handleCustomCompanyPress = () => {
    const customCompanyName = searchQuery.trim();
    if (customCompanyName) {
      onCompanySelect(customCompanyName);
      setSearchQuery("");
      Keyboard.dismiss();
      onClose();
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleScreenTap = () => {
    Keyboard.dismiss();
  };

  return (
    <OnboardingBlurModal
      visible={visible}
      onClose={onClose}
      title="Company - Search"
    >
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <CustomView style={styles.container}>
          {/* Search Input */}
          <OnboardingSearch
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Company"
            autoFocus={false}
            autoCorrect={false}
            spellCheck={false}
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />

          {/* Company Results */}
          <ScrollView
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {searchQuery.length > 1 ? (
              <>
                {/* Show custom company option first if available */}
                {hasCustomOption && (
                  <TouchableOpacity
                    style={[
                      styles.customCompanyButton,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.light_blue,
                      },
                    ]}
                    onPress={handleCustomCompanyPress}
                  >
                    <CustomText
                      style={[
                        styles.customCompanyText,
                        { color: colors.light_blue },
                      ]}
                    >
                      + Add "{searchQuery.trim()}"
                    </CustomText>
                  </TouchableOpacity>
                )}
                
                {/* Show filtered results */}
                {filteredCompanies.map((company) => (
                  <OnboardingCompanyItem
                    key={company.id}
                    company={company}
                    onPress={handleCompanyPress}
                    searchTerm={searchQuery}
                  />
                ))}
              </>
            ) : (
              DEFAULT_COMPANIES.map((company) => (
                <OnboardingCompanyItem
                  key={company.id}
                  company={company}
                  onPress={handleCompanyPress}
                />
              ))
            )}
          </ScrollView>
        </CustomView>
      </TouchableWithoutFeedback>
    </OnboardingBlurModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
  },
  companyContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  companyIcon: {
    fontSize: scaleFontSize(20),
    marginRight: 12,
    width: 24,
    textAlign: "center",
    lineHeight: scaleFontSize(20),
  },
  companyTextContainer: {
    flex: 1,
  },
  companyText: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
  customCompanyButton: {
    marginVertical: 15,
    paddingVertical: verticalScale(12),
    paddingHorizontal: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  customCompanyText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
  },
});