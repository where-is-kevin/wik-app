export interface OnboardingSelections {
  [key: string]:
    | number
    | number[]
    | { min: number; max: number }
    | { id: string; name: string; country: string; fullName: string }
    | undefined;
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
    | "budget-selection"
    | "location-selection"
    | "personal-form"
    | "card-swipe"
    | "final-slide"
    | "tag-selection"
    | "travel-email"
    | "travel-name"
    | "code-slide";
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

// Common initial step for both flows
const initialStep: OnboardingStep = {
  key: "userType",
  title: "Let's personalize your experience",
  subtitle: "Are you travelling for business or leisure?",
  type: "logo-selection",
  options: ["💼 For business", "🏖️ For leisure"],
  allowMultipleSelections: false,
};

// Business travel onboarding steps
const businessSteps: OnboardingStep[] = [
  {
    key: "businessTravelReason",
    title: "What's your goal for this trip?",
    subtitle: "Select all that apply to tailor your trip.",
    type: "option-list",
    options: [
      "📈 Grow sales and leads",
      "👥 Find investors and partners",
      "💼 Recruit top talent",
      "🌎 Build your network",
    ],
    allowMultipleSelections: true,
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
  },
  {
    key: "businessFinalSlide",
    title: "Let's finish setting up your business profile",
    subtitle:
      "To discover the right people and opportunities on your next trip",
    type: "final-slide" as const,
    options: [],
  },
  {
    key: "personalInfo",
    title: "Tell us about yourself",
    subtitle: "We need some basic information to create your profile",
    type: "personal-form" as const,
    options: [],
  },
];

// Leisure travel onboarding steps
const leisureSteps: OnboardingStep[] = [
  {
    key: "personalTravelReason",
    title: "What's your reason for traveling?",
    subtitle: "Select all that apply to tailor your trip.",
    type: "option-list",
    options: [
      "🏝️ Rest and relaxation",
      "🧗‍♀️ Adventure and exploration",
      "🏠 Visiting family and friends",
      "💻 Remote work",
    ],
    allowMultipleSelections: true,
  },
  {
    key: "personalTravelFrequency",
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
        text: "Local street food",
        icon: "🥟",
        category: "Food and Drink",
      },
      {
        number: 4,
        text: "Bars and nightlife",
        icon: "🍷",
        category: "Food and Drink",
      },
      {
        number: 5,
        text: "Museums and galleries",
        icon: "🖼️",
        category: "Experiences and Culture",
      },
      {
        number: 6,
        text: "Events and festivals",
        icon: "🎪",
        category: "Experiences and Culture",
      },
      {
        number: 7,
        text: "Guided tours",
        icon: "🖊️",
        category: "Experiences and Culture",
      },
      {
        number: 8,
        text: "Outdoor adventures",
        icon: "🏔️",
        category: "Experiences and Culture",
      },
      {
        number: 9,
        text: "Souvenirs and local craft",
        icon: "💡",
        category: "Shopping",
      },
      { number: 10, text: "Fashion", icon: "👕", category: "Shopping" },
    ],
  },
  {
    key: "personalTravelBudget",
    title: "What is your daily budget?",
    subtitle:
      "Please estimate a daily budget per person (excluding flights and accommodation).",
    type: "budget-selection",
    options: [],
    allowMultipleSelections: false,
  },
  {
    key: "travelDestination",
    title: "Where are you planning to go?",
    subtitle:
      "We'll show you recommendations for this location. Don't worry, you can always change it or add more spots later.",
    type: "location-selection",
    options: [],
    allowMultipleSelections: false,
  },
  {
    key: "travelPreferences",
    title: "It all starts with a swipe!",
    subtitle: "We'll suggest more of what you swipe right on.",
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
    key: "travelFinalSlide",
    title: "You're all set! Your adventure is waiting",
    subtitle: "Finish setting up your profile to unlock your favourites.",
    type: "final-slide" as const,
    options: [],
  },
  {
    key: "travelName",
    title: "Firstly, what's your name?",
    subtitle: "So we know what to call you",
    type: "travel-name" as const,
    options: [],
  },
  {
    key: "travelEmail",
    title: "Welcome, !",
    subtitle: "Add your email so we can verify your identity",
    type: "travel-email" as const,
    options: [],
  },
  {
    key: "travelCode",
    title: "Verify your identity",
    subtitle: "Enter the 6-digit code sent to ",
    type: "code-slide" as const,
    options: [],
  },
];

// Separate flows - no more combined array
export const getBusinessFlow = (): OnboardingStep[] => [
  initialStep,
  ...businessSteps,
];

export const getLeisureFlow = (): OnboardingStep[] => [
  initialStep,
  ...leisureSteps,
];

// Combined onboarding steps for backward compatibility (deprecated)
export const onboardingSteps: OnboardingStep[] = [
  initialStep,
  ...businessSteps.map(step => ({ ...step, condition: { key: "userType", value: 0 } })),
  ...leisureSteps.map(step => ({ ...step, condition: { key: "userType", value: 1 } })),
];

// Export individual arrays for cleaner access
export { initialStep, businessSteps, leisureSteps };