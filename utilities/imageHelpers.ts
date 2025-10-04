import { STATIC_IMAGES } from "@/constants/images";

export const getValidImageUrl = (imageUrl: string): string | null => {
  if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
    return imageUrl;
  }
  return null;
};

export const getImageSource = (imageUrl: string) => {
  const validImageUrl = getValidImageUrl(imageUrl);
  return validImageUrl
    ? { uri: validImageUrl }
    : { uri: "" }; // Return empty to trigger SVG placeholder instead of blurry PNG
};
