import * as React from "react";
import Svg, { Path } from "react-native-svg";
const LikeFilledSvg = ({ ...props }) => (
  <Svg width={16} height={15} viewBox="0 0 16 15" fill="none" {...props}>
    <Path
      d="M5.5 6L8 2L10 6L14 6.5L11 9.5L11.5 13.5L8 12.5L3.5 14L4 9.5L1.5 6.5L5.5 6Z"
      fill="#131314"
      stroke="#131314"
    />
  </Svg>
);
export default LikeFilledSvg;
