// Shared store and utilities for custom expertise tags

export interface ExpertiseTag {
  id: string;
  name: string;
  color: string;
}

// Generate random colors for custom tags
export const getRandomColor = () => {
  const colors = [
    "#9C27B0", // Purple
    "#FF5722", // Deep Orange
    "#607D8B", // Blue Grey
    "#795548", // Brown
    "#FF9800", // Orange
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#E91E63", // Pink
    "#009688", // Teal
    "#FFC107", // Amber
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Global store for custom tags with their colors (shared across components)
export const customTagsStore: { [key: string]: string } = {};

// Get predefined expertise tags
export const getExpertiseTags = (colors: any): ExpertiseTag[] => [
  { id: "product-design", name: "Product Design", color: colors.light_blue },
  { id: "legal", name: "Legal", color: colors.legal_green },
  { id: "software-dev", name: "Software Development", color: colors.venue_orange },
  { id: "ai", name: "AI", color: colors.label_dark },
  { id: "marketing", name: "Marketing", color: colors.pink },
  { id: "content-creation", name: "Content Creation", color: colors.bordo },
];

// Get color for any expertise (predefined or custom)
export const getExpertiseColor = (expertiseName: string, themeColors: any): string => {
  const predefinedTag = getExpertiseTags(themeColors).find(tag => tag.name === expertiseName);
  
  if (predefinedTag) {
    return predefinedTag.color;
  }
  
  // For custom tags, use stored color or generate new one
  if (!customTagsStore[expertiseName]) {
    customTagsStore[expertiseName] = getRandomColor();
  }
  
  return customTagsStore[expertiseName];
};