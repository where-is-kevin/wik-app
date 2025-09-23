import * as React from "react";
import Svg, { Path } from "react-native-svg";
const BackSvg = ({ stroke = "white", ...props }) => (
  <Svg width={14} height={23} viewBox="0 0 14 23" fill="none" {...props}>
    <Path
      d="M11.7498 20.8751L2.37476 11.5001L11.7498 2.12512"
      stroke={stroke}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default BackSvg;
