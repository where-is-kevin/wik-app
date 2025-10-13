import * as React from "react";
import Svg, { Path, Rect, Polygon } from "react-native-svg";

const PigeonSvg = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 350.01 350" fill="none" {...props}>
    <Polygon
      points="175 350 175 349.99 0 174.99 0 0 175 0 175 175 350 350 175 350"
      fill="#3C62FA"
    />
    <Path d="M175,175V0l175,175h-175,0Z" fill="#F84808" />
    <Path d="M350.01,175v175l-175-175h175Z" fill="#131314" />
    <Rect x="50.01" y="50" width="75" height="75" fill="#FFFFFF" />
    <Rect x="75.01" y="50" width="50" height="50" fill="#131314" />
  </Svg>
);

export default PigeonSvg;
