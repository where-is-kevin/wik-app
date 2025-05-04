

export type OnboardingSelections = {
    [key: string]: number;
  }
export type Condition = {
    key: string;
    value: number;
  }
  
export type OnboardingStep = {
    key: string;
    title: string;
    subtitle: string;
    type: "logo-selection" | "option-list";
    options: string[];
    condition?: Condition;
  }
export const onboardingSteps: OnboardingStep[] = [
    {
      key: "userType",
      title: "Tell us more about yourself",
      subtitle: "Are you a business or personal user?",
      type: "logo-selection", // Special layout with logo
      options: ["Business user", "Personal user"],
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
      condition: { key: "userType", value: 1 },
    },
  ];