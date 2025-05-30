import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";

const PigeonSvg = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect width={12} height={12} fill="#3C62FA" />
    <Path d="M12 12V0L24 12H12Z" fill="#F84808" />
    <Path d="M12 24V12L24 24H12Z" fill="#3C62FA" />
    <Path d="M12 12L12 24L2.00275e-06 12L12 12Z" fill="#3C62FA" />
    <Path d="M24 12L24 24L12 12L24 12Z" fill="#131314" />
    <Rect x={3.42871} y={3.42859} width={5.14286} height={5.14286} fill="white" />
    <Rect x={5.14307} y={3.42859} width={3.42857} height={3.42857} fill="#131314" />
  </Svg>
);

export default PigeonSvg;