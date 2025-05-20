import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const PlusSvg = ({ ...props }) => (
  <Svg width={16} height={15} viewBox="0 0 16 15" fill="none" {...props}>
    <Path
      d="M8 1.5V13.5M2 7.5H14"
      stroke="#A3A3A8"
      strokeWidth={2.67}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default PlusSvg;
