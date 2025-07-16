// utilities/formatTags.ts
export const formatTags = (tags: string): string[] => {
  if (!tags) return [];

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0) // Remove empty tags
    .map((tag) => {
      return tag
        .toLowerCase()
        .split(/[_\s-]+/) // Split on underscores, spaces, or hyphens
        .map((word) => {
          // Handle special cases for common abbreviations
          if (word === "atm") return "ATM";
          if (word === "rv") return "RV";
          if (word === "tv") return "TV";
          if (word === "wifi") return "WiFi";
          if (word === "api") return "API";
          if (word === "gps") return "GPS";
          if (word === "usa") return "USA";
          if (word === "uk") return "UK";

          // Regular capitalization for other words
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    })
    .slice(0, 3); // Limit to first 5 tags to avoid UI overflow
};
