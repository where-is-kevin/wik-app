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
    | "business-personal-form"
    | "business-work-form"
    | "card-swipe"
    | "final-slide"
    | "tag-selection"
    | "business-tag-selection"
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
    key: "businessConnections",
    title: "Who do you want to connect with?",
    subtitle: "Select your top 5 so we can connect you with the right people.",
    type: "business-tag-selection",
    options: [],
    allowMultipleSelections: true,
    tags: [
      { number: 1, text: "Executives", icon: "‍‍🧑‍💼", category: "Business" },
      { number: 2, text: "Investors", icon: "💰", category: "Business" },
      { number: 3, text: "Founders", icon: "👩‍💻", category: "Business" },
      { number: 4, text: "Engineers/Developers", icon: "🛠️", category: "Tech" },
      { number: 5, text: "Designers", icon: "🎨", category: "Creative" },
      { number: 6, text: "Legal", icon: "🏛️", category: "Professional" },
      { number: 7, text: "Content Creators", icon: "📱", category: "Media" },
      {
        number: 8,
        text: "Advisor/Consultants",
        icon: "🧭",
        category: "Advisory",
      },
      { number: 9, text: "Marketing", icon: "📣", category: "Business" },
      { number: 10, text: "Operations", icon: "⚙️", category: "Business" },
      { number: 11, text: "Recruiters", icon: "🤝", category: "HR" },
      { number: 12, text: "Finance", icon: "💵", category: "Finance" },
      {
        number: 13,
        text: "Sales/Business Development",
        icon: "📈",
        category: "Sales",
      },
      { number: 14, text: "Data", icon: "📊", category: "Analytics" },
      {
        number: 15,
        text: "Community Builders",
        icon: "👥",
        category: "Community",
      },
      { number: 16, text: "Growth", icon: "🚀", category: "Business" },
      {
        number: 17,
        text: "Speakers/Thought Leaders",
        icon: "🎤",
        category: "Influence",
      },
    ],
  },
  {
    key: "businessIndustries",
    title: "What industries are you interested in?",
    subtitle:
      "Select up to 5 industries to discover the most relevant events and connect with key people.",
    type: "business-tag-selection",
    options: [],
    allowMultipleSelections: true,
    tags: [
      { number: 1, text: "Technology", icon: "💻", category: "Tech" },
      { number: 2, text: "AI", icon: "🤖", category: "Tech" },
      { number: 3, text: "Hardware", icon: "⚙️", category: "Tech" },
      {
        number: 4,
        text: "Healthcare/Biotech",
        icon: "🧬",
        category: "Healthcare",
      },
      { number: 5, text: "Wellness/Fitness", icon: "⚖️", category: "Wellness" },
      { number: 6, text: "Automotive", icon: "🚗", category: "Manufacturing" },
      {
        number: 7,
        text: "Hospitality/Tourism",
        icon: "✈️",
        category: "Service",
      },
      { number: 8, text: "Cybersecurity", icon: "🔒", category: "Security" },
      { number: 9, text: "Blockchain/Web3", icon: "🔗", category: "Crypto" },
      { number: 10, text: "Retail/E-commerce", icon: "🛒", category: "Retail" },
      {
        number: 11,
        text: "Sustainability",
        icon: "♻️",
        category: "Environment",
      },
      { number: 12, text: "Food and Beverage", icon: "🍕", category: "F&B" },
      { number: 13, text: "Finance/Fintech", icon: "💰", category: "Finance" },
      {
        number: 14,
        text: "Beauty/Personal Care",
        icon: "💄",
        category: "Beauty",
      },
      { number: 15, text: "Education", icon: "🎓", category: "Education" },
    ],
  },
  {
    key: "businessNetworkStyle",
    title: "How do you want to network?",
    subtitle: "Let us know your networking style",
    type: "option-list",
    options: [
      "🍴Curated group dinners",
      "☕️ 1-on-1 coffee chats",
      "🍻 Casual mixers",
      "🧩 Hackathons & workshops",
    ],
    allowMultipleSelections: true,
  },
  {
    key: "businessDestination",
    title: "Where are you planning to go?",
    subtitle:
      "We'll show you business opportunities for this location. Don't worry, you can always change it or add more spots later.",
    type: "location-selection",
    options: [],
    allowMultipleSelections: false,
  },
  {
    key: "businessPreferences",
    title: "It all starts with a swipe!",
    subtitle: "We'll suggest more of what you swipe right on.",
    type: "card-swipe" as const,
    options: [], // Not used for card swipe
    cards: [
      {
        id: "coworking1",
        title: "Modern Coworking Space",
        description: "Network with entrepreneurs and remote workers",
        imageUrl: "https://picsum.photos/id/1015/300/200", // Placeholder
      },
      {
        id: "conference1",
        title: "Tech Conference",
        description: "Industry leaders sharing latest innovations",
        imageUrl: "https://picsum.photos/id/1043/300/200", // Placeholder
      },
      {
        id: "networking1",
        title: "Business Networking Event",
        description: "Connect with investors and potential partners",
        imageUrl: "https://picsum.photos/id/1056/300/200", // Placeholder
      },
      {
        id: "startup1",
        title: "Startup Meetup",
        description: "Meet founders and learn about new ventures",
        imageUrl: "https://picsum.photos/id/1060/300/200", // Placeholder
      },
    ],
  },
  {
    key: "businessFinalSlide",
    title: "You're all set! Your business adventure is waiting",
    subtitle:
      "Finish setting up your profile to unlock your networking opportunities.",
    type: "final-slide" as const,
    options: [],
  },
  {
    key: "businessPersonalName",
    title: "Firstly, who are you?",
    subtitle:
      "This information will be shown to others on the app for networking purposes",
    type: "business-personal-form" as const,
    options: [],
  },
  {
    key: "businessWorkInfo",
    title: "Tell us about your work",
    subtitle:
      "This information will be shown to others on the app for networking purposes",
    type: "business-work-form" as const,
    options: [],
  },
  {
    key: "businessEmail",
    title: "Lastly, what is your email?",
    subtitle: "Add your email so we can verify your identity",
    type: "travel-email" as const,
    options: [],
  },
  {
    key: "businessCode",
    title: "Verify your identity",
    subtitle: "Enter the 6-digit code sent to ",
    type: "code-slide" as const,
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
    subtitle: "Select up to 10 things that matter to you most.",
    type: "tag-selection",
    options: [],
    allowMultipleSelections: true,
    tags: [
      // Food and drink (12 tags)
      {
        number: 1,
        text: "Coffee shops",
        icon: "☕️",
        category: "Food and drink",
      },
      {
        number: 2,
        text: "Restaurants",
        icon: "🍝",
        category: "Food and drink",
      },
      { number: 3, text: "Brunch", icon: "🍳", category: "Food and drink" },
      { number: 4, text: "Bakery", icon: "🥐", category: "Food and drink" },
      { number: 5, text: "Italian", icon: "🍕", category: "Food and drink" },
      {
        number: 6,
        text: "Mediterranean",
        icon: "🐠",
        category: "Food and drink",
      },
      { number: 7, text: "Mexican", icon: "🌮", category: "Food and drink" },
      { number: 8, text: "Asian", icon: "🍣", category: "Food and drink" },
      { number: 9, text: "Vegetarian", icon: "🥦", category: "Food and drink" },
      {
        number: 10,
        text: "Fine dining",
        icon: "🥂",
        category: "Food and drink",
      },
      {
        number: 11,
        text: "Wine tasting",
        icon: "🍷",
        category: "Food and drink",
      },
      { number: 12, text: "Sweets", icon: "🍭", category: "Food and drink" },

      // Entertainment (9 tags)
      {
        number: 13,
        text: "Bars and nightlife",
        icon: "🍻",
        category: "Entertainment",
      },
      { number: 14, text: "Live music", icon: "🎸", category: "Entertainment" },
      { number: 15, text: "Comedy", icon: "🤡", category: "Entertainment" },
      { number: 16, text: "Concerts", icon: "🎤", category: "Entertainment" },
      { number: 17, text: "Techno", icon: "🎧", category: "Entertainment" },
      { number: 18, text: "Dancing", icon: "💃", category: "Entertainment" },
      { number: 19, text: "Festivals", icon: "🎉", category: "Entertainment" },
      { number: 20, text: "Games", icon: "🧩", category: "Entertainment" },
      { number: 21, text: "Movies", icon: "🍿", category: "Entertainment" },

      // Culture and arts (5 tags)
      {
        number: 22,
        text: "Art galleries",
        icon: "🖼",
        category: "Culture and arts",
      },
      { number: 23, text: "Museums", icon: "🗿", category: "Culture and arts" },
      {
        number: 24,
        text: "Cooking classes",
        icon: "👨‍🍳",
        category: "Culture and arts",
      },
      { number: 25, text: "Theater", icon: "🎭", category: "Culture and arts" },
      {
        number: 26,
        text: "Historical sites",
        icon: "🏛️",
        category: "Culture and arts",
      },

      // Outdoor and nature (5 tags)
      {
        number: 27,
        text: "Beaches",
        icon: "🏖️",
        category: "Outdoor and nature",
      },
      {
        number: 28,
        text: "Outdoor cinema",
        icon: "🎬",
        category: "Outdoor and nature",
      },
      {
        number: 29,
        text: "Hiking",
        icon: "🧗",
        category: "Outdoor and nature",
      },
      {
        number: 30,
        text: "Surfing",
        icon: "🏄",
        category: "Outdoor and nature",
      },
      {
        number: 31,
        text: "Wellness",
        icon: "🧖‍♀️",
        category: "Outdoor and nature",
      },

      // Experiences and activities (7 tags)
      {
        number: 32,
        text: "Guided tours",
        icon: "🗺️",
        category: "Experiences and activities",
      },
      {
        number: 33,
        text: "Hidden gems",
        icon: "💎",
        category: "Experiences and activities",
      },
      {
        number: 34,
        text: "Rooftops and terraces",
        icon: "🌆",
        category: "Experiences and activities",
      },
      {
        number: 35,
        text: "Epic views",
        icon: "🌁",
        category: "Experiences and activities",
      },
      {
        number: 36,
        text: "Fun",
        icon: "🤩",
        category: "Experiences and activities",
      },
      {
        number: 37,
        text: "Viral/popular",
        icon: "🔥",
        category: "Experiences and activities",
      },
      {
        number: 38,
        text: "Pet-friendly",
        icon: "🐶",
        category: "Experiences and activities",
      },
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
  ...businessSteps.map((step) => ({
    ...step,
    condition: { key: "userType", value: 0 },
  })),
  ...leisureSteps.map((step) => ({
    ...step,
    condition: { key: "userType", value: 1 },
  })),
];

// Export individual arrays for cleaner access
export { initialStep, businessSteps, leisureSteps };
