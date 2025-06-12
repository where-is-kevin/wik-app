

export interface OnboardingSelections {
  [key: string]: number | number[] | undefined;
}
export type Condition = {
    key: string;
    value: number;
  }
  
export type OnboardingStep = {
  key: string;
  title: string;
  subtitle: string;
  type: "logo-selection" | "option-list" | "personal-form" | "card-swipe" | "final-slide";
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
}
export const onboardingSteps: OnboardingStep[] = [
    {
      key: "userType",
      title: "Tell us more about yourself",
      subtitle: "Are you a business or personal user?",
      type: "logo-selection", // Special layout with logo
      options: ["Business user", "Personal user"],
      allowMultipleSelections: false,
    },
    {
      key: "businessTravelReason",
      title: "What is your primary reason for traveling?",
      subtitle: "Tell us more about yourself",
      type: "option-list",
      options: [
        "Attending conferences or trade shows",
        "Client meetings or project work",
        "Networking or investor meetings",
        "Remote work or co-working",
      ],
      allowMultipleSelections: true,
      condition: { key: "userType", value: 0 },
    },
    {
      key: "personalTravelReason",
      title: "What is your primary reason for traveling?",
      subtitle: "Tell us more about yourself",
      type: "option-list",
      options: [
        "Leisure or vacation",
        "Adventure or exploration",
        "Visiting family or friends",
        "Digital nomad or remote work",
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
      title: "How often do you travel for personal reasons?",
      subtitle: "Tell us more about yourself",
      type: "option-list",
      options: [
        "Frequently (monthly or more)",
        "Occasionally (a few times a year)",
        "Rarely (only for special occasions)",
        "Never",
      ],
      allowMultipleSelections: false,
      condition: { key: "userType", value: 1 },
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
      key: "businessTravelActivities",
      title: "What activities are most important to you during work trips?",
      subtitle: "Tell us more about yourself",
      type: "option-list",
      options: [
        "Business meetings and networking events",
        "Exploring local culture and cuisine",
        "Balancing work with leisure activities",
        "Co-working and productivity",
      ],
      allowMultipleSelections: true,
      condition: { key: "userType", value: 0 },
    },
    {
      key: "personalTravelActivities",
      title: "What activities are most important to you during work trips?",
      subtitle: "Tell us more about yourself",
      type: "option-list",
      options: [
        "Relaxation and wellness (e.g., spas, yoga)",
        "Adventure and outdoor activities (e.g., hiking, diving)",
        "Cultural immersion and local experiences",
        "Nightlife and social events",
      ],
      allowMultipleSelections: true,
      condition: { key: "userType", value: 1 },
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