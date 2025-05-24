import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = ({ ...props }) => (
  <Svg width={30} height={30} viewBox="0 0 30 30" fill="none" {...props}>
    <Path
      d="M18.75 24.375L9.375 15L18.75 5.625"
      stroke="#3C62FA"
      strokeWidth={3.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
