import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const isSmall = width <= 375;

const guidelineBaseWidth = () => {
  if (isSmall) {
    //390
    return 330;
  } else if (width >= 430) {
    // iPhone 16 Pro/Pro Max and larger devices
    return 430;
  } else if (width >= 410) {
    // iPhone 14 Pro Max and similar
    return 375;
  }
  return 350;
};

const horizontalScale = (size: number) => (width / guidelineBaseWidth()) * size;

const guidelineBaseHeight = () => {
  if (isSmall) {
    //620
    return 550;
  } else if (width >= 430) {
    // iPhone 16 Pro/Pro Max and larger devices (932px+ height)
    return 900;
  } else if (width > 410) {
    // iPhone 14 Pro Max and similar
    return 700;
  } else if (width >= 390) {
    // iPhone 13 Pro and similar (844px height)
    return 760;
  }
  return 680;
};

const verticalScale = (size: number) => (height / guidelineBaseHeight()) * size;

const guidelineBaseFonts = () => {
  // console.log(width, 'screen widthh');
  if (width >= 430) {
    // iPhone 16 Pro/Pro Max and larger devices
    return 430;
  } else if (width > 410) {
    // iPhone 14 Pro Max and similar
    return 420;
  }
  return 400;
};

const scaleFontSize = (size: number) =>
  Math.round((width / guidelineBaseFonts()) * size);

export { horizontalScale, verticalScale, scaleFontSize };
