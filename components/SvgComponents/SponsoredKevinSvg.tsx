import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SponsoredKevinSvg = ({ ...props }) => (
  <Svg width={10} height={11} viewBox="0 0 10 11" fill="none" {...props}>
    <Rect y={0.5} width={5} height={5} fill="#3C62FA" />
    <Path d="M5 5.5V0.5L10 5.5H5Z" fill="#F84808" />
    <Path d="M5 10.5V5.5L10 10.5H5Z" fill="#3C62FA" />
    <Path d="M5 5.5L5 10.5L9.13951e-07 5.5L5 5.5Z" fill="#3C62FA" />
    <Path d="M10 5.5L10 10.5L5 5.5L10 5.5Z" fill="#131314" />
    <Rect
      x={1.42853}
      y={1.92773}
      width={2.14286}
      height={2.14286}
      fill="white"
    />
    <Rect
      x={2.14282}
      y={1.92773}
      width={1.42857}
      height={1.42857}
      fill="#131314"
    />
  </Svg>
);
export default SponsoredKevinSvg;
