// constants/images.ts
import ImagePlaceholderSvg from "@/components/SvgComponents/ImagePlaceholderSvg";

export const STATIC_IMAGES = {
  PLACEHOLDER_IMAGE: require("@/assets/images/placeholder-bucket.png"), // Legacy PNG fallback
  PLACEHOLDER_SVG: ImagePlaceholderSvg, // New crisp SVG placeholder (preferred)
  APPROVE_IMAGE: require("@/assets/images/approve.png"),
  CANCEL_IMAGE: require("@/assets/images/cancel.png"),
  ARROW_UP: require("@/assets/images/arrow-up.png"),
} as const;
