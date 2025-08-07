// helpers/getMarkerColor.ts
import EventsSvg from "@/components/SvgComponents/EventsSvg";
import VenuesSvg from "@/components/SvgComponents/VenuesSvg";
import ExperiencesSvg from "@/components/SvgComponents/ExperiencesSvg";

export type CategoryType = "event" | "experience" | "venue" | string;

export const getMarkerColor = (
  category: CategoryType
): "bordo" | "profile_name_black" | "venue_orange" => {
  switch (category?.toLowerCase()) {
    case "event":
      return "bordo";
    case "experience":
      return "profile_name_black";
    case "venue":
      return "venue_orange";
    default:
      return "profile_name_black"; // fallback to experience color
  }
};

export const getMarkerIcon = (category: CategoryType) => {
  switch (category?.toLowerCase()) {
    case "event":
      return EventsSvg;
    case "experience":
      return ExperiencesSvg;
    case "venue":
      return VenuesSvg;
    default:
      return ExperiencesSvg; // fallback to experience icon
  }
};
