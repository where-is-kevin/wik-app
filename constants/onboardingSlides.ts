export interface OnboardingSelections {
  [key: string]: number | number[] | undefined;
}
export type Condition = {
  key: string;
  value: number;
};

export type OnboardingStep = {
  key: string;
  title: string;
  subtitle: string;
  type:
    | "logo-selection"
    | "option-list"
    | "tag-list"
    | "budget-selection"
    | "personal-form"
    | "card-swipe"
    | "final-slide"
    | "tag-selection";
  options: string[];
  condition?: Condition;
  allowMultipleSelections?: boolean;
  // For card-swipe type, we'll add additional data
  cards?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }[];
  // For tag-selection type
  tags?: {
    number: number;
    text: string;
    icon: string;
    category: string;
  }[];
};
export const onboardingSteps: OnboardingStep[] = [
  {
    key: "userType",
    title: "Let’s personalize your experience",
    subtitle: "Are you travelling for business or leisure?",
    type: "logo-selection",
    options: ["💼 For business", "🏖️ For leisure"],
    allowMultipleSelections: false,
  },
  {
    key: "businessTravelReason",
    title: "What’s your goal for this trip?",
    subtitle: "Select all that apply to tailor your trip.",
    type: "option-list",
    options: [
      "📈 Grow sales and leads",
      "👥 Find investors and partners",
      "💼 Recruit top talent",
      "🌎 Build your network",
    ],
    allowMultipleSelections: true,
    condition: { key: "userType", value: 0 },
  },
  {
    key: "personalTravelReason",
    title: "What’s your reason for traveling?",
    subtitle: "Select all that apply to tailor your trip.",
    type: "option-list",
    options: [
      "🏝️ Rest and relaxation",
      "🧗‍♀️ Adventure and exploration",
      "🏠 Visiting family and friends",
      "💻 Remote work",
    ],
    allowMultipleSelections: true,
    condition: { key: "userType", value: 1 },
  },
  {
    key: "businessTravelFrequency",
    title: "How often do you travel for work?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "Weekly or more",
      "Monthly",
      "A few times a year",
      "Rarely (only for special events)",
    ],
    allowMultipleSelections: false,
    condition: { key: "userType", value: 0 },
  },
  {
    key: "personalTravelFrequency",
    title: "What do you value the most when you travel?",
    subtitle: "Pick up to 10 things you spend the most on",
    type: "tag-selection",
    options: [],
    allowMultipleSelections: true,
    condition: { key: "userType", value: 1 },
    tags: [
      { number: 1, text: "Coffee shops", icon: "☕️", category: "Food and Drink" },
      { number: 2, text: "Restaurants", icon: "🍽️", category: "Food and Drink" },
      { number: 3, text: "Local street food", icon: "🥟", category: "Food and Drink" },
      { number: 4, text: "Bars and nightlife", icon: "🍷", category: "Food and Drink" },
      { number: 5, text: "Museums and galleries", icon: "🖼️", category: "Experiences and Culture" },
      { number: 6, text: "Events and festivals", icon: "🎪", category: "Experiences and Culture" },
      { number: 7, text: "Guided tours", icon: "🖊️", category: "Experiences and Culture" },
      { number: 8, text: "Outdoor adventures", icon: "🏔️", category: "Experiences and Culture" },
      { number: 9, text: "Souvenirs and local craft", icon: "💡", category: "Shopping" },
      { number: 10, text: "Fashion", icon: "👕", category: "Shopping" },
    ],
  },
  {
    key: "businessTravelAccommodations",
    title: "What type of accommodations do you prefer?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "Luxury hotels or private villas",
      "Mid-range business hotels",
      "Budget-friendly options (e.g., Airbnb, hostels)",
      "Co-living spaces or serviced apartments",
    ],
    allowMultipleSelections: true,
    condition: { key: "userType", value: 0 },
  },
  {
    key: "personalTravelAccommodations",
    title: "What type of accommodations do you prefer?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "Luxury hotels or resorts",
      "Mid-range hotels or vacation rentals",
      "Budget-friendly options (e.g., hostels, Airbnb)",
      "Eco-friendly or sustainable accommodations",
    ],
    allowMultipleSelections: true,
    condition: { key: "userType", value: 1 },
  },
  {
    key: "businessTravelBudget",
    title: "What is your budget for travel?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "High (company-funded or premium experiences)",
      "Moderate (company-funded with some flexibility)",
      "Low (self-funded or budget-conscious)",
      "Varies (depends on the trip)",
    ],
    allowMultipleSelections: false,
    condition: { key: "userType", value: 0 },
  },
  {
    key: "personalTravelBudget",
    title: "What is your budget for travel?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "High (I’m willing to splurge on experiences)",
      "Moderate (I look for value but don’t mind spending)",
      "Low (I’m budget-conscious and seek deals)",
    ],
    allowMultipleSelections: false,
    condition: { key: "userType", value: 1 },
  },
  {
    key: "travelValues",
    title: "What do you value the most when you travel?",
    subtitle: "Pick up to 10 things you spend the most on",
    type: "tag-selection",
    options: [],
    allowMultipleSelections: true,
    tags: [
      {
        number: 1,
        text: "Coffee shops",
        icon: "☕️",
        category: "Food and Drink",
      },
      {
        number: 2,
        text: "Restaurants",
        icon: "🍽️",
        category: "Food and Drink",
      },
      {
        number: 3,
        text: "Museums and galleries",
        icon: "🖼️",
        category: "Experiences and Culture",
      },
      {
        number: 4,
        text: "Events and festivals",
        icon: "🎪",
        category: "Experiences and Culture",
      },
      {
        number: 5,
        text: "Souvenirs and local craft",
        icon: "🎁",
        category: "Shopping",
      },
      { number: 6, text: "Fashion", icon: "👕", category: "Shopping" },
    ],
  },
  {
    key: "businessTravelTech",
    title: "How tech-savvy are you?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "Very tech-savvy (I rely on apps for everything)",
      "Moderately tech-savvy (I use apps but prefer simplicity)",
      "Not very tech-savvy (I prefer human assistance)",
    ],
    allowMultipleSelections: false,
    condition: { key: "userType", value: 0 },
  },
  {
    key: "personalTravelTech",
    title: "How tech-savvy are you?",
    subtitle: "Tell us more about yourself",
    type: "option-list",
    options: [
      "Very tech-savvy (I rely on apps for everything)",
      "Moderately tech-savvy (I use apps but prefer simplicity)",
      "Not very tech-savvy (I prefer human assistance)",
    ],
    allowMultipleSelections: false,
    condition: { key: "userType", value: 1 },
  },
  {
    key: "personalDetails",
    title: "You will be able to change this info later",
    subtitle: "Finalise setting up your profile",
    type: "personal-form" as const,
    options: [],
    // condition: { key: "userType", value: 1 }, // Only for personal users
  },
  {
    key: "travelPreferences",
    title: "Swipe on Your Travel Preferences",
    subtitle: "Swipe right for places you'd like to visit",
    type: "card-swipe" as const,
    options: [], // Not used for card swipe
    cards: [
      {
        id: "beach1",
        title: "Tropical Beach Paradise",
        description: "White sand beaches and crystal clear water",
        imageUrl: "https://picsum.photos/id/1036/300/200", // Placeholder
      },
      {
        id: "mountain1",
        title: "Mountain Adventure",
        description: "Breathtaking views and hiking trails",
        imageUrl: "https://picsum.photos/id/1016/300/200", // Placeholder
      },
      {
        id: "city1",
        title: "Urban Exploration",
        description: "City life, museums, and fine dining",
        imageUrl: "https://picsum.photos/id/1029/300/200", // Placeholder
      },
      {
        id: "historical1",
        title: "Historical Journey",
        description: "Ancient ruins and cultural heritage",
        imageUrl: "https://picsum.photos/id/1024/300/200", // Placeholder
      },
    ],
  },
  {
    key: "finalSlide",
    title: "You are all set!",
    subtitle: "You can now start exploring",
    type: "final-slide" as const,
    options: [],
  },
];
