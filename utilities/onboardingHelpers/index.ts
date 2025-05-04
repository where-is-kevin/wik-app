import { onboardingSteps } from "@/constants/onboardingSlides";

export const getTotalStepsForPath = (path: "business" | "personal"): number => {
  const userTypeValue = path === "business" ? 0 : 1;
  return onboardingSteps.filter(
    (step) =>
      !step.condition ||
      step.condition.key !== "userType" ||
      step.condition.value === userTypeValue
  ).length;
};

export const BUSINESS_PATH_STEPS = getTotalStepsForPath("business");
export const PERSONAL_PATH_STEPS = getTotalStepsForPath("personal");
export const MAX_PATH_STEPS = Math.max(BUSINESS_PATH_STEPS, PERSONAL_PATH_STEPS);